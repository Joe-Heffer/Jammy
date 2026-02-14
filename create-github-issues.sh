#!/bin/bash

# Script to create GitHub issues for Jammy Iteration 1
# Usage: GITHUB_TOKEN=your_token ./create-github-issues.sh

set -e

REPO="Joe-Heffer/Jammy"
API_URL="https://api.github.com/repos/$REPO/issues"

if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_TOKEN environment variable is required"
  echo "Usage: GITHUB_TOKEN=your_token ./create-github-issues.sh"
  echo ""
  echo "Get a token at: https://github.com/settings/tokens"
  echo "Required scopes: repo"
  exit 1
fi

# Function to create an issue
create_issue() {
  local title="$1"
  local body="$2"
  local labels="$3"

  echo "Creating issue: $title"

  curl -s -X POST "$API_URL" \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    -H "Content-Type: application/json" \
    -d "$(jq -n \
      --arg title "$title" \
      --arg body "$body" \
      --argjson labels "$labels" \
      '{title: $title, body: $body, labels: $labels}')" \
    | jq -r '.html_url // .message'

  echo ""
}

# Issue 1: PIN Authentication
create_issue \
  "Implement PIN Authentication System" \
  "$(cat <<'EOF'
Implement a PIN-based authentication system to protect the jam list and discovery pages. This includes middleware to protect routes, API endpoints for PIN verification, session cookie management, and a PIN entry UI component.

## Requirements

### Auth Library (\`src/lib/auth.ts\`)
- Function to verify PIN against \`JAM_PIN\` environment variable
- Cookie signing and verification using \`SESSION_SECRET\`
- Session cookie creation with 30-day expiry
- Helper to check if request has valid session

### API Endpoint (\`src/app/api/auth/route.ts\`)
- POST \`/api/auth\` - Accept PIN, verify, and set httpOnly session cookie
- Return 401 for invalid PIN
- Return 200 + redirect URL for valid PIN

### Middleware (\`src/middleware.ts\`)
- Check for valid session cookie on \`/jam/*\` and \`/discover/*\` routes
- Redirect to \`/\` (PIN entry) if no valid session
- Allow public access to \`/\` and \`/api/auth\`

### PIN Entry Component (\`src/components/PinEntry.tsx\`)
- Clean UI with 4-digit PIN input (or text field)
- Submit button to send PIN to \`/api/auth\`
- Show "DENIED" message with shake animation on wrong PIN
- Redirect to \`/jam\` on successful auth
- Match rock/metal theme aesthetic

## Acceptance Criteria

- [ ] Invalid PIN shows error message and doesn't grant access
- [ ] Valid PIN sets cookie and redirects to \`/jam\`
- [ ] Protected routes redirect to \`/\` when not authenticated
- [ ] Session persists for 30 days
- [ ] Cookies are httpOnly and signed for security
- [ ] PIN entry UI matches design system

## Technical Notes

- Use Next.js middleware for route protection
- Store PIN in \`JAM_PIN\` env var (set in Vercel dashboard)
- Use \`SESSION_SECRET\` for signing cookies
- Consider using \`jose\` or \`iron-session\` for secure cookie handling
EOF
)" \
  '["feature", "auth", "iteration-1", "priority-high"]'

# Issue 2: Songs CRUD API
create_issue \
  "Build Songs CRUD API Endpoints" \
  "$(cat <<'EOF'
Create REST API endpoints for managing songs in the jam list. This includes listing all songs, creating new songs, retrieving individual songs, updating song status/notes, and deleting songs.

## Requirements

### List & Create (\`src/app/api/songs/route.ts\`)

**GET /api/songs** - Return all songs with optional filtering/sorting
- Query params: \`status\`, \`sortBy\` (createdAt, artist, title)
- Return full song objects with all metadata

**POST /api/songs** - Create a new song
- Validate required fields: title, artist
- Auto-set createdAt, updatedAt timestamps
- Return created song with generated ID

### Get, Update, Delete (\`src/app/api/songs/[id]/route.ts\`)

**GET /api/songs/[id]** - Return single song by ID
- Return 404 if not found

**PATCH /api/songs/[id]** - Update song fields
- Allow updating: status, notes, difficulty levels, resource URLs
- Update \`updatedAt\` timestamp
- Validate status enum values

**DELETE /api/songs/[id]** - Delete song by ID
- Return 204 on success
- Return 404 if not found

## Acceptance Criteria

- [ ] GET /api/songs returns all songs from database
- [ ] GET /api/songs?status=learning filters by status
- [ ] POST /api/songs creates song with valid data
- [ ] POST /api/songs validates required fields (400 on missing)
- [ ] GET /api/songs/[id] returns single song
- [ ] PATCH /api/songs/[id] updates allowed fields only
- [ ] PATCH validates status enum (want_to_jam, learning, can_play, nailed_it)
- [ ] DELETE /api/songs/[id] removes song from database
- [ ] All endpoints return proper HTTP status codes
- [ ] All endpoints handle errors gracefully

## Technical Notes

- Use Drizzle ORM for all database operations
- Import schema from \`src/lib/db/schema.ts\`
- Return JSON responses with proper content-type headers
- Use Next.js App Router route handlers (not Pages API)
EOF
)" \
  '["feature", "api", "iteration-1", "priority-high"]'

# Issue 3: Jam List Dashboard
create_issue \
  "Create Jam List Dashboard UI" \
  "$(cat <<'EOF'
Build the main jam list dashboard at \`/jam\` with a filterable/sortable grid of song cards showing cover art, metadata, status, and quick action links.

## Requirements

### Song Card Component (\`src/components/SongCard.tsx\`)
- Display album art (or placeholder if missing)
- Show title, artist, album
- Display status badge (StatusBadge component)
- Show bass & drums difficulty if set
- Quick action buttons: Spotify, YouTube, Tabs, Lyrics
- Click card to navigate to song detail page
- Hover effect with glow border (rock/metal aesthetic)

### Status Badge Component (\`src/components/StatusBadge.tsx\`)
- Color-coded by status:
  - Want to Jam: Red with pulsing dot
  - Learning: Amber with steady dot
  - Can Play: Blue with check icon
  - Nailed It: Green with fire/lightning icon
- Match theme design tokens

### Jam List Component (\`src/components/JamList.tsx\`)
- Grid layout (responsive: 1 col mobile, 2-3 cols tablet, 3-4 cols desktop)
- Filter controls: All, Want to Jam, Learning, Can Play, Nailed It
- Sort controls: Recently Added, Artist, Title, Status
- Empty state message when no songs
- Loading state while fetching

### Dashboard Page (\`src/app/jam/page.tsx\`)
- Fetch songs from \`/api/songs\`
- Pass data to JamList component
- Header with "Add Song" and "Discover" buttons
- Search/filter bar

## Acceptance Criteria

- [ ] Song cards display all metadata correctly
- [ ] Clicking a card navigates to \`/jam/[id]\`
- [ ] Status badges show correct colors and icons
- [ ] Filtering by status works correctly
- [ ] Sorting by different fields works
- [ ] Empty state shows when no songs match filter
- [ ] Loading state appears while data loads
- [ ] Layout is responsive on mobile, tablet, desktop
- [ ] Cards have hover effects matching theme
- [ ] Quick action buttons link to correct URLs

## Design Notes

- Use Tailwind CSS with rock/metal theme tokens from \`globals.css\`
- Album art should have subtle vignette/darkened edge
- Card backgrounds: \`#171717\`, hover: \`#262626\`
- Status badges styled like guitar picks or amp knobs
- Sharp, punchy transitions (no floaty animations)
EOF
)" \
  '["feature", "ui", "iteration-1", "priority-high"]'

# Issue 4: Add Song Page
create_issue \
  "Build Add Song Page with Manual Entry Form" \
  "$(cat <<'EOF'
Create the "Add Song" page at \`/jam/add\` with a manual entry form for adding songs to the jam list. Spotify search integration will come in Iteration 3, so this is manual-only for now.

## Requirements

### Add Song Page (\`src/app/jam/add/page.tsx\`)

Form with fields:
- Title (required)
- Artist (required)
- Album (optional)
- YouTube URL (optional)
- Status dropdown (default: "Want to Jam")
- Bass difficulty (easy/medium/hard)
- Drums difficulty (easy/medium/hard)
- Added by (radio buttons: "Dad" / "Son")
- Notes (textarea)

Other requirements:
- Submit button to POST to \`/api/songs\`
- Cancel button to go back to \`/jam\`
- Form validation (title & artist required)
- Success: redirect to \`/jam\` with toast message
- Error: show error message below form

## Acceptance Criteria

- [ ] Form displays all required fields
- [ ] Title and Artist validation prevents empty submission
- [ ] Status dropdown shows all 4 status options
- [ ] Difficulty dropdowns show easy/medium/hard
- [ ] Added by selector works (Dad/Son)
- [ ] Submit creates song via API and redirects
- [ ] Cancel button returns to jam list
- [ ] Form shows loading state during submission
- [ ] Error messages display on API failure
- [ ] Success shows toast/message before redirect

## Design Notes

- Match rock/metal theme (dark backgrounds, red accents)
- Use Input, Button, Card components from UI library
- Clear visual hierarchy with bold labels
- Form should be centered on page with max-width
EOF
)" \
  '["feature", "ui", "iteration-1", "priority-medium"]'

# Issue 5: Base UI Components
create_issue \
  "Create Base UI Component Library" \
  "$(cat <<'EOF'
Build foundational UI components styled to the rock/metal theme that will be reused throughout the app. These components should be clean, accessible, and match the design system defined in \`globals.css\`.

## Requirements

### Button Component (\`src/components/ui/Button.tsx\`)
- Variants: primary (red), secondary (gray), danger (red outline)
- Sizes: small, medium, large
- States: default, hover, active, disabled, loading
- Support for icons (left/right)
- TypeScript props with proper types

### Card Component (\`src/components/ui/Card.tsx\`)
- Dark surface background (\`#171717\`)
- Subtle border (\`#2a2a2a\`)
- Hover state with glow effect
- Padding variants
- Optional header/footer sections

### Input Component (\`src/components/ui/Input.tsx\`)
- Text input with label
- Textarea variant
- Select/dropdown variant
- Error state with message
- Focus ring in theme color
- Placeholder styling

### Badge Component (\`src/components/ui/Badge.tsx\`)
- Color variants: red, amber, green, blue, gray
- Size variants: small, medium
- Optional dot indicator
- Support for icons

## Acceptance Criteria

- [ ] All components are TypeScript with proper prop types
- [ ] Components use Tailwind classes from theme tokens
- [ ] Buttons have hover/focus/active states
- [ ] Cards have hover glow effect
- [ ] Inputs show error states properly
- [ ] Badges support all color variants
- [ ] All components are accessible (ARIA, keyboard nav)
- [ ] Components are responsive
- [ ] Loading states work for async actions
- [ ] Disabled states are visually distinct

## Design Reference

**Colors** (from \`globals.css\`):
- Primary: \`#dc2626\` (red)
- Accent: \`#ea580c\` (orange)
- Background: \`#0a0a0a\`
- Surface: \`#171717\`
- Border: \`#2a2a2a\`

**Typography**:
- Headings: Oswald (bold, condensed)
- Body: Inter
- Monospace: for badges/status

## Technical Notes

- Use \`forwardRef\` for proper ref handling
- Support \`className\` prop for custom overrides
- Use Radix UI or Headless UI for accessible primitives
- Export from \`src/components/ui/index.ts\` barrel file
EOF
)" \
  '["feature", "ui", "iteration-1", "priority-high"]'

# Issue 6: Database Migration
create_issue \
  "Setup Database Migration to PostgreSQL (Neon)" \
  "$(cat <<'EOF'
Prepare for production deployment by migrating the database schema from SQLite to PostgreSQL (Neon). This issue involves updating the schema definition, Drizzle config, and database connection logic to support both SQLite (dev) and Postgres (prod).

## Requirements

### Update Schema (\`src/lib/db/schema.ts\`)
- Change from \`sqliteTable\` to \`pgTable\`
- Update ID field to use \`uuid().primaryKey().defaultRandom()\`
- Update timestamps to \`timestamp({ withTimezone: true })\`
- Add PostgreSQL-specific indexes

### Update Drizzle Config (\`drizzle.config.ts\`)
- Switch dialect from \`"sqlite"\` to \`"postgresql"\`
- Configure for Neon connection string
- Keep development-friendly defaults

### Update DB Connection (\`src/lib/db/index.ts\`)
- Conditionally use SQLite for \`NODE_ENV=development\`
- Use \`@neondatabase/serverless\` for production
- Import correct Drizzle driver based on environment

### Update package.json
- Add \`@neondatabase/serverless\` dependency
- Keep \`better-sqlite3\` for dev
- Add PostgreSQL migration scripts

## Acceptance Criteria

- [ ] Schema uses PostgreSQL-compatible types
- [ ] \`pnpm db:push\` works in development (SQLite)
- [ ] Database connection switches based on NODE_ENV
- [ ] Neon Postgres connection works in production
- [ ] All existing queries continue to work
- [ ] Type exports (Song, NewSong) remain valid

## Technical Notes

- Don't deploy until Iteration 1 is complete and tested with SQLite
- Test migration locally with a test Neon database first
- Neon free tier supports up to 10GB storage (plenty for this app)
- Set \`DATABASE_URL\` in Vercel env vars for production
EOF
)" \
  '["infrastructure", "database", "iteration-2", "priority-medium"]'

echo "✅ All issues created successfully!"
echo ""
echo "View issues at: https://github.com/$REPO/issues"
