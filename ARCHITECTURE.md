# Jammy - Architecture & System Design

> A shared jam tracker for bass + drums. Find songs, learn them, play them.

---

## Overview

Jammy is a web app that lets two musicians (father & son) manage a shared list
of songs they want to jam together. It integrates with music platforms, surfaces
bass tabs / drum charts / lyrics, and suggests new tracks to learn — all wrapped
in a dark, aggressive rock/metal aesthetic.

**Core use cases:**

1. Add songs to a shared "want to jam" list via Spotify/YouTube search
2. Track progress per song (want to jam → learning → nailed it)
3. View bass tabs, drum charts, and lyrics inline or via links
4. Get recommendations for new songs to try based on what's on the list
5. Quick-link to Spotify/YouTube to listen

---

## Tech Stack

| Layer        | Technology                  | Why                                              |
| ------------ | --------------------------- | ------------------------------------------------ |
| Framework    | Next.js 15 (App Router)     | Full-stack React, SSR, API routes, Vercel-native  |
| Language     | TypeScript                  | Type safety across frontend + backend             |
| Database     | Neon Postgres (via Vercel)  | Free tier, serverless, zero-config on Vercel      |
| ORM          | Drizzle ORM                 | Lightweight, type-safe, great Neon support        |
| Styling      | Tailwind CSS v4             | Utility-first, easy to build custom dark theme    |
| Auth         | PIN-based (cookie session)  | Simple shared access, no user accounts needed     |
| Deployment   | Vercel (auto-deploy)        | Push to `main` → live. Free tier covers this app  |
| Package Mgr  | pnpm                        | Fast, disk-efficient                              |

---

## External APIs

### Spotify Web API
- **Search** (`/v1/search`): Find songs by name/artist, get Spotify IDs, album art, preview URLs
- **Auth**: Client Credentials flow (server-side only, no user login needed)
- **Note**: The recommendations endpoint was deprecated in Nov 2024. We use Last.fm for suggestions instead.
- **Docs**: https://developer.spotify.com/documentation/web-api

### YouTube Data API v3
- **Search** (`/youtube/v3/search`): Find official audio/video, live performances, play-along videos
- **Embed**: Embed player directly in song detail pages
- **Docs**: https://developers.google.com/youtube/v3

### Last.fm API
- **`track.getSimilar`**: Get similar tracks based on listening data (free, no auth required beyond API key)
- **`artist.getSimilar`**: Find similar artists to broaden the jam list
- **Why Last.fm?** Spotify killed their recommendations endpoint. Last.fm's similarity data is crowd-sourced from billions of scrobbles and is free/reliable.
- **Docs**: https://www.last.fm/api

### Songsterr API
- **Search** (`/a/ra/songs.json?pattern=...`): Find bass tabs and drum charts
- **No API key required**, returns JSON with song IDs
- **Tab links**: Direct link to interactive tab player on Songsterr
- **Supports**: Guitar, bass, and drums tabs
- **Docs**: https://www.songsterr.com/a/wa/api/

### Genius API
- **Search** (`/search`): Find song lyrics pages
- **Returns**: Song URLs, metadata, album art
- **Lyrics**: Link to Genius page (lyrics are copyrighted; linking is the clean approach)
- **Requires**: Free API token (client access token)
- **Docs**: https://docs.genius.com/

---

## App Structure

```
Jammy/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout (fonts, theme, nav)
│   │   ├── page.tsx                  # PIN entry / landing page
│   │   │
│   │   ├── jam/                      # Main app (PIN-protected)
│   │   │   ├── layout.tsx            # App shell (nav bar, sidebar)
│   │   │   ├── page.tsx              # Jam list dashboard
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx          # Song detail (tabs, charts, lyrics, player)
│   │   │   └── add/
│   │   │       └── page.tsx          # Add song (Spotify/YouTube search)
│   │   │
│   │   ├── discover/                 # Song recommendations
│   │   │   └── page.tsx              # "What should we jam next?"
│   │   │
│   │   └── api/                      # API routes
│   │       ├── auth/
│   │       │   └── route.ts          # POST: verify PIN, set session cookie
│   │       ├── songs/
│   │       │   ├── route.ts          # GET: list songs, POST: add song
│   │       │   └── [id]/
│   │       │       └── route.ts      # GET/PATCH/DELETE a song
│   │       ├── search/
│   │       │   ├── spotify/
│   │       │   │   └── route.ts      # Search Spotify catalog
│   │       │   └── youtube/
│   │       │       └── route.ts      # Search YouTube videos
│   │       ├── discover/
│   │       │   └── route.ts          # Get recommendations via Last.fm
│   │       └── resources/
│   │           ├── tabs/
│   │           │   └── route.ts      # Search Songsterr for bass/drum tabs
│   │           └── lyrics/
│   │               └── route.ts      # Search Genius for lyrics links
│   │
│   ├── components/
│   │   ├── ui/                       # Base UI components (Button, Card, Input, Badge)
│   │   ├── PinEntry.tsx              # PIN code input screen
│   │   ├── SongCard.tsx              # Song in the jam list (cover art, status, quick actions)
│   │   ├── JamList.tsx               # Filterable/sortable song list
│   │   ├── SongDetail.tsx            # Full song view with tabbed resources
│   │   ├── SpotifySearch.tsx         # Search Spotify with autocomplete
│   │   ├── YouTubeEmbed.tsx          # Embedded YouTube player
│   │   ├── TabViewer.tsx             # Songsterr tab embed/link (bass + drums)
│   │   ├── LyricsPanel.tsx           # Genius lyrics link + annotations
│   │   ├── RecommendationCard.tsx    # Suggested song card with "add to list" action
│   │   ├── StatusBadge.tsx           # Jam status indicator
│   │   └── Nav.tsx                   # Top navigation bar
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts              # Drizzle client + Neon connection
│   │   │   ├── schema.ts             # Database schema (Drizzle)
│   │   │   └── migrate.ts            # Migration runner
│   │   ├── spotify.ts                # Spotify API client (search, metadata)
│   │   ├── youtube.ts                # YouTube API client (search, embed URLs)
│   │   ├── lastfm.ts                 # Last.fm API client (similar tracks/artists)
│   │   ├── songsterr.ts              # Songsterr API client (tab search)
│   │   ├── genius.ts                 # Genius API client (lyrics search)
│   │   ├── auth.ts                   # PIN verification, session helpers
│   │   └── utils.ts                  # Shared utilities
│   │
│   └── styles/
│       └── globals.css               # Tailwind base + rock/metal theme tokens
│
├── drizzle/                          # Generated migrations
├── public/
│   ├── fonts/                        # Custom rock/metal typefaces
│   └── grain.png                     # Subtle noise/grain texture overlay
│
├── .env.example                      # Required env vars template
├── drizzle.config.ts                 # Drizzle Kit config
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── vercel.json                       # Vercel deployment config
```

---

## Database Schema

Single table to start. No over-engineering — one table gets us very far for two users.

```sql
CREATE TABLE songs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  artist        TEXT NOT NULL,
  album         TEXT,

  -- Status tracking
  status        TEXT NOT NULL DEFAULT 'want_to_jam'
                CHECK (status IN ('want_to_jam', 'learning', 'can_play', 'nailed_it')),
  bass_difficulty   TEXT CHECK (bass_difficulty IN ('easy', 'medium', 'hard')),
  drums_difficulty  TEXT CHECK (drums_difficulty IN ('easy', 'medium', 'hard')),

  -- Platform links
  spotify_id    TEXT,
  spotify_url   TEXT,
  youtube_url   TEXT,
  cover_art_url TEXT,

  -- Resource links (populated on add or lazily)
  songsterr_url     TEXT,       -- Link to Songsterr tab page
  songsterr_bass_id INTEGER,    -- Songsterr song ID for bass tab
  songsterr_drum_id INTEGER,    -- Songsterr song ID for drum chart
  genius_url        TEXT,       -- Link to Genius lyrics page

  -- Metadata
  notes         TEXT,           -- Free-form notes ("tune down to drop D", etc.)
  added_by      TEXT,           -- Just a name string ("Dad" / "Max")
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_songs_status ON songs(status);
CREATE INDEX idx_songs_artist ON songs(artist);
```

### Drizzle Schema (TypeScript)

```typescript
import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const songs = pgTable('songs', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  artist: text('artist').notNull(),
  album: text('album'),

  status: text('status').notNull().default('want_to_jam'),
  bassDifficulty: text('bass_difficulty'),
  drumsDifficulty: text('drums_difficulty'),

  spotifyId: text('spotify_id'),
  spotifyUrl: text('spotify_url'),
  youtubeUrl: text('youtube_url'),
  coverArtUrl: text('cover_art_url'),

  songsterrUrl: text('songsterr_url'),
  songsterrBassId: integer('songsterr_bass_id'),
  songsterrDrumId: integer('songsterr_drum_id'),
  geniusUrl: text('genius_url'),

  notes: text('notes'),
  addedBy: text('added_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
```

---

## Authentication Flow

Simple PIN-based protection. No user accounts, no OAuth.

```
┌─────────────┐     POST /api/auth      ┌──────────────┐
│  PIN Entry  │ ──────────────────────►  │  Compare to  │
│   Screen    │     { pin: "1234" }      │  env JAM_PIN │
└─────────────┘                          └──────┬───────┘
                                                │
                              ┌─────────────────┼─────────────────┐
                              │ Match           │                 │ No match
                              ▼                 │                 ▼
                    Set httpOnly cookie          │         Return 401
                    (signed, 30-day exp)         │
                              │                 │
                              ▼                 │
                    Redirect to /jam             │
```

- **PIN stored in**: `JAM_PIN` environment variable (Vercel env settings)
- **Session**: Signed httpOnly cookie, 30-day expiry
- **Middleware**: Next.js middleware checks cookie on `/jam/*` and `/discover/*` routes
- **"added_by"**: Simple name picker on the add-song form (no auth tied to it)

---

## Page Designs

### 1. PIN Entry (`/`)

Dark screen, centered PIN input. App logo/name with grungy typography.
Four-digit PIN pad or text input. Wrong PIN shows a shake animation +
"DENIED" in red. Correct PIN fades into the jam list.

### 2. Jam List Dashboard (`/jam`)

The main screen. Grid of song cards showing:

```
┌──────────────────────────────────────────────────────────┐
│  🔍 Search / Filter          [+ Add Song]   [Discover]  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Filter: [All] [Want to Jam] [Learning] [Nailed It]      │
│  Sort:   [Recently Added] [Artist] [Status]              │
│                                                          │
│  ┌─────────────────────┐  ┌─────────────────────┐       │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │       │
│  │ ▓  album art      ▓ │  │ ▓  album art      ▓ │       │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │       │
│  │                     │  │                     │       │
│  │ Toxicity             │  │ Dammit              │       │
│  │ System of a Down     │  │ Blink-182            │       │
│  │                     │  │                     │       │
│  │ ● LEARNING          │  │ ● WANT TO JAM       │       │
│  │ Bass: Medium        │  │ Bass: Easy           │       │
│  │ Drums: Hard         │  │ Drums: Medium        │       │
│  │                     │  │                     │       │
│  │ [Spotify] [YouTube] │  │ [Spotify] [YouTube]  │       │
│  │ [Tabs]    [Lyrics]  │  │ [Tabs]    [Lyrics]   │       │
│  └─────────────────────┘  └─────────────────────┘       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 3. Song Detail (`/jam/[id]`)

Full-page view for a single song with tabbed resource panels:

```
┌──────────────────────────────────────────────────────────┐
│  ← Back to List                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────┐  Toxicity                                │
│  │ album art  │  System of a Down · Toxicity (2001)      │
│  │            │                                          │
│  │            │  Status: [Want to Jam ▾]                  │
│  └────────────┘  Bass: Medium · Drums: Hard              │
│                  Added by Dad · 3 days ago                │
│                                                          │
│  [▶ Spotify]  [▶ YouTube]                                │
│                                                          │
├──[Bass Tab]──[Drum Chart]──[Lyrics]──[Notes]─────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Songsterr embedded tab viewer / link              │  │
│  │  (interactive bass tablature)                      │  │
│  │                                                    │  │
│  │  Or: "Open in Songsterr →"                         │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  YouTube embed (play-along or tutorial)            │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 4. Add Song (`/jam/add`)

Search-driven. Type a song name → hits Spotify API → pick from results →
auto-populates metadata, album art, and links. Then auto-searches Songsterr
and Genius in the background to populate resource links.

```
┌──────────────────────────────────────────────────────────┐
│  Add a Song                                              │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Search: [toxicity system of a do...]        [Search]    │
│                                                          │
│  Results:                                                │
│  ┌────────────────────────────────────────────────────┐  │
│  │ ▓▓ Toxicity · System of a Down · Toxicity    [+]  │  │
│  │ ▓▓ Chop Suey! · System of a Down · Toxicity  [+]  │  │
│  │ ▓▓ Aerials · System of a Down · Toxicity      [+]  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ── Or add manually ──                                   │
│  Title:  [____________]                                  │
│  Artist: [____________]                                  │
│  YouTube URL: [____________]                             │
│                                                          │
│  Added by: (Dad) (Son)                                   │
│  Notes: [__________________________________]             │
│                                                          │
│                                        [Add to Jam List] │
└──────────────────────────────────────────────────────────┘
```

### 5. Discover (`/discover`)

Recommendations based on artists/songs already in the jam list.

```
┌──────────────────────────────────────────────────────────┐
│  Discover · New tracks to jam                            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Based on your jam list:                                 │
│                                                          │
│  Because you like System of a Down:                      │
│  ┌──────────────────────────┐ ┌──────────────────────┐  │
│  │ Killing in the Name      │ │ Du Hast              │  │
│  │ Rage Against the Machine │ │ Rammstein            │  │
│  │ [Preview] [+ Add]        │ │ [Preview] [+ Add]    │  │
│  └──────────────────────────┘ └──────────────────────┘  │
│                                                          │
│  Because you like Blink-182:                             │
│  ┌──────────────────────────┐ ┌──────────────────────┐  │
│  │ The Rock Show             │ │ Fat Lip              │  │
│  │ Blink-182                 │ │ Sum 41               │  │
│  │ [Preview] [+ Add]        │ │ [Preview] [+ Add]    │  │
│  └──────────────────────────┘ └──────────────────────┘  │
│                                                          │
│                          [Refresh Suggestions]           │
└──────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Adding a Song

```
User types song name
        │
        ▼
  Spotify Search API ──► Show results with album art
        │
        │ User picks a song
        ▼
  Save to Neon Postgres (title, artist, album, spotify_id, cover_art_url)
        │
        │ Background (async, non-blocking):
        ├──► Songsterr API: search for bass tab + drum chart → save URLs
        ├──► Genius API: search for lyrics page → save URL
        └──► YouTube API: search for play-along/tutorial → save URL
```

### Getting Recommendations

```
  Load unique artists from songs table
        │
        ▼
  For each artist (or sample of top artists):
        │
        ├──► Last.fm track.getSimilar (seed: popular track by artist)
        └──► Last.fm artist.getSimilar (seed: artist name)
        │
        ▼
  Deduplicate, filter out songs already in jam list
        │
        ▼
  Enrich with Spotify metadata (album art, preview URL)
        │
        ▼
  Return to client
```

---

## Visual Design: Rock/Metal Aesthetic

### Color Palette

```
Background:     #0a0a0a  (near-black)
Surface:        #171717  (dark gray, card backgrounds)
Surface hover:  #262626  (lighter gray)
Border:         #2a2a2a  (subtle dark borders)

Primary:        #dc2626  (blood red - actions, highlights)
Primary hover:  #b91c1c  (darker red)
Accent:         #ea580c  (electric orange - secondary highlights)
Warning:        #f59e0b  (amber - "learning" status)
Success:        #22c55e  (green - "nailed it" status)

Text primary:   #f5f5f5  (off-white)
Text secondary: #a3a3a3  (muted gray)
Text muted:     #525252  (dark gray, subtle labels)
```

### Typography

- **Headings**: Bold, condensed sans-serif (e.g., Oswald or Bebas Neue) — concert poster energy
- **Body**: Clean sans-serif (Inter or Geist) — readable at all sizes
- **Monospace accents**: For tab notation, status badges

### Texture & Effects

- Subtle grain/noise overlay on the background (CSS `background-image` with a tiny tiled PNG)
- Cards have a slight inner glow or red border-glow on hover
- Status badges styled like guitar picks or amp knobs
- Transitions: sharp, punchy — no floaty animations
- Album art with a subtle vignette/darkened edge treatment

### Status Indicators

| Status       | Color   | Label Style          |
| ------------ | ------- | -------------------- |
| Want to Jam  | Red     | Pulsing dot + bold   |
| Learning     | Amber   | Steady dot           |
| Can Play     | Blue    | Check icon           |
| Nailed It    | Green   | Fire/lightning icon  |

---

## Environment Variables

```bash
# .env.example

# PIN auth
JAM_PIN=                     # 4-8 digit PIN for app access
SESSION_SECRET=              # Random string for signing session cookies

# Database (auto-set by Vercel Neon integration)
DATABASE_URL=                # Neon Postgres connection string

# Spotify (https://developer.spotify.com/dashboard)
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=

# YouTube (https://console.cloud.google.com)
YOUTUBE_API_KEY=

# Last.fm (https://www.last.fm/api/account/create)
LASTFM_API_KEY=

# Genius (https://genius.com/api-clients)
GENIUS_ACCESS_TOKEN=
```

---

## Deployment (Vercel)

### Auto-Deploy Setup

1. Connect GitHub repo to Vercel
2. Add Neon Postgres via Vercel Marketplace (auto-sets `DATABASE_URL`)
3. Set remaining env vars in Vercel dashboard
4. Every push to `main` → automatic production deploy

### `vercel.json`

```json
{
  "framework": "nextjs",
  "buildCommand": "pnpm run build",
  "installCommand": "pnpm install"
}
```

### CI Flow

```
Push to main
    │
    ▼
Vercel detects push → installs deps → builds Next.js → deploys
    │
    ▼
Live at jammy.vercel.app (or custom domain)
```

---

## Local Development

### SQLite for Dev, Neon Postgres for Prod

Local development uses **SQLite** via `better-sqlite3` for zero-setup iteration.
Production will use **Neon Postgres** via `@neondatabase/serverless`.

```
Local dev:   SQLite (better-sqlite3) → local.db file
Production:  Neon Postgres            → DATABASE_URL env var
```

The Drizzle schema lives in `src/lib/db/schema.ts` (currently `sqlite-core`).
When deploying to production, migrate it to `pg-core` — see Iteration 2 below.

### Getting Started

```bash
pnpm install
pnpm db:push          # Create SQLite tables from schema
pnpm dev              # Start Next.js dev server at localhost:3000
```

### Useful Commands

```bash
pnpm db:generate      # Generate migration files from schema changes
pnpm db:migrate       # Run pending migrations
pnpm db:studio        # Open Drizzle Studio (visual DB browser)
pnpm lint             # Run ESLint
pnpm build            # Production build
```

---

## Implementation Roadmap

### Current State (Iteration 0) — Infrastructure

What's been built:

- [x] Project initialized (Next.js 15, TypeScript, Tailwind v4, pnpm)
- [x] Drizzle ORM configured with SQLite for local dev
- [x] `songs` table schema with full column set and type exports
- [x] Rock/metal theme tokens in Tailwind (`globals.css`)
- [x] Root layout with Inter (body) + Oswald (headings) fonts
- [x] Placeholder landing page
- [x] Environment variable template (`.env.example`)
- [x] Vercel deployment config

### Iteration 1 — Core CRUD + Auth

**Goal:** A working app where you can add, view, edit, and delete songs behind a PIN.

- [ ] **PIN auth flow**
  - `src/lib/auth.ts` — PIN verification + cookie signing helpers
  - `src/app/api/auth/route.ts` — POST endpoint (verify PIN → set session cookie)
  - `src/middleware.ts` — Protect `/jam/*` and `/discover/*` routes
  - `src/components/PinEntry.tsx` — PIN input screen on `/`
- [ ] **Songs CRUD API**
  - `src/app/api/songs/route.ts` — GET (list all), POST (create)
  - `src/app/api/songs/[id]/route.ts` — GET, PATCH (update status/notes), DELETE
- [ ] **Jam List page** (`/jam`)
  - `src/components/SongCard.tsx` — Song card with cover art, status, quick links
  - `src/components/JamList.tsx` — Filterable/sortable grid of song cards
  - `src/components/StatusBadge.tsx` — Color-coded status indicator
  - `src/app/jam/page.tsx` — Dashboard wired to the songs API
- [ ] **Add Song page** (`/jam/add`)
  - Manual-only form initially (Spotify search comes in Iteration 3)
  - Title, artist, album, YouTube URL, status, difficulty, notes, added_by
- [ ] **Base UI components** (`src/components/ui/`)
  - Button, Card, Input, Badge — styled to the rock/metal theme

### Iteration 2 — Production Database

**Goal:** Deploy to Vercel with Neon Postgres.

- [ ] **Migrate schema** from `sqlite-core` → `pg-core`
  - `id` becomes `uuid().primaryKey().defaultRandom()`
  - `createdAt`/`updatedAt` become `timestamp({ withTimezone: true })`
  - Update `drizzle.config.ts` dialect to `"postgresql"`
- [ ] **Swap DB connection** in `src/lib/db/index.ts`
  - Use `@neondatabase/serverless` driver
  - Conditional: SQLite for `NODE_ENV=development`, Neon for production
- [ ] **Run initial migration** on Neon via `pnpm db:push`
- [ ] **Set env vars** in Vercel dashboard
- [ ] **Deploy** — push to `main`, verify on Vercel

### Iteration 3 — Spotify Search Integration

**Goal:** Search Spotify to add songs with rich metadata auto-populated.

- [ ] `src/lib/spotify.ts` — Client Credentials auth + search endpoint
- [ ] `src/app/api/search/spotify/route.ts` — Proxy Spotify search
- [ ] `src/components/SpotifySearch.tsx` — Type-ahead search, pick from results
- [ ] Update Add Song page to use Spotify search with manual fallback
- [ ] Auto-populate: title, artist, album, cover art, Spotify URL/ID

### Iteration 4 — Resource Links (Tabs, Lyrics, YouTube)

**Goal:** Surface bass tabs, drum charts, lyrics, and YouTube videos per song.

- [ ] `src/lib/songsterr.ts` — Search Songsterr for bass/drum tabs
- [ ] `src/lib/genius.ts` — Search Genius for lyrics page links
- [ ] `src/lib/youtube.ts` — Search YouTube for play-along/tutorial videos
- [ ] `src/app/api/resources/tabs/route.ts` — Songsterr search proxy
- [ ] `src/app/api/resources/lyrics/route.ts` — Genius search proxy
- [ ] `src/app/api/search/youtube/route.ts` — YouTube search proxy
- [ ] **Song Detail page** (`/jam/[id]`)
  - `src/components/SongDetail.tsx` — Full song view
  - `src/components/TabViewer.tsx` — Songsterr tab link/embed
  - `src/components/LyricsPanel.tsx` — Genius lyrics link
  - `src/components/YouTubeEmbed.tsx` — Embedded YouTube player
- [ ] Auto-fetch resources on song add (background, non-blocking)

### Iteration 5 — Discover (Recommendations)

**Goal:** Suggest new songs to jam based on what's already in the list.

- [ ] `src/lib/lastfm.ts` — `track.getSimilar` + `artist.getSimilar`
- [ ] `src/app/api/discover/route.ts` — Aggregate recommendations
- [ ] `src/components/RecommendationCard.tsx` — Suggested song with "Add" action
- [ ] `src/app/discover/page.tsx` — Discovery feed grouped by seed artist

### Iteration 6 — Polish + PWA

**Goal:** Tighten the UX, add the finishing touches.

- [ ] Grain texture overlay (`public/grain.png`)
- [ ] Song card hover glow effects
- [ ] Status badge animations (pulsing dot, fire icon)
- [ ] Mobile-responsive layout tuning
- [ ] `manifest.json` for PWA installability
- [ ] Nav component (`src/components/Nav.tsx`)
- [ ] Loading states and error boundaries

---

## Future Ideas (Not in v1)

- **Setlist mode**: Arrange songs into a practice setlist with a timer
- **Progress tracking**: Log practice sessions, track improvement over time
- **Audio recorder**: Record jam sessions directly in the app
- **Metronome**: Built-in metronome with BPM per song
- **Tuner**: Bass tuner built into the app
- **Genre tags**: Filter by subgenre (thrash, punk, nu-metal, etc.)
- **Mobile PWA**: Install as app on phone for garage/practice room use
