# CLAUDE.md

## Project Overview

Jammy is a shared jam session playlist planner for two musicians (father & son). It lets users add songs to a shared "want to jam" list, track progress per song, view bass tabs/drum charts/lyrics, and get recommendations. Built with Next.js 15 (App Router), React 19, TypeScript, Drizzle ORM, and Neon PostgreSQL.

## Quick Reference

```bash
pnpm install              # Install dependencies
pnpm dev                  # Start dev server
pnpm build                # Production build
pnpm lint                 # Run ESLint
pnpm exec tsc --noEmit    # Type check (what CI runs)
pnpm test                 # Run tests
pnpm test:watch           # Run tests in watch mode
pnpm test:coverage        # Run tests with coverage report
pnpm test:ui              # Run tests with UI
pnpm db:generate          # Generate Drizzle migrations
pnpm db:migrate           # Apply migrations
pnpm db:push              # Push schema to database (sync)
pnpm db:studio            # Open Drizzle Studio GUI
```

## Tech Stack

- **Framework:** Next.js 15.1 with App Router
- **Language:** TypeScript 5.7+ (strict mode)
- **UI:** React 19, Tailwind CSS v4
- **ORM:** Drizzle ORM with PostgreSQL (Neon serverless)
- **Package manager:** pnpm (v9) - always use pnpm, not npm/yarn
- **Testing:** Vitest with React Testing Library and coverage reporting
- **Linting:** ESLint 9 (flat config) extending `next/core-web-vitals` and `next/typescript`
- **Deployment:** Vercel with auto-deploy on push to `main`
- **CI:** GitHub Actions (lint, type check, test with coverage, build)

## Project Structure

```
src/
  app/
    api/
      auth/route.ts          # POST: PIN verification, session creation
      songs/route.ts          # GET/POST: list and create songs
      songs/[id]/route.ts     # GET/PATCH/DELETE: single song operations
    jam/page.tsx              # Main jam list dashboard (protected)
    page.tsx                  # PIN entry landing page
    layout.tsx                # Root layout
    globals.css               # Tailwind theme tokens and global styles
  components/
    JamList.tsx               # Song list container (filtering/sorting)
    PinEntry.tsx              # PIN code input
    SongCard.tsx              # Song card with quick actions
    StatusBadge.tsx           # Status indicator
    ui/                       # Reusable UI primitives (Button, Card, Input, Badge)
  lib/
    auth.ts                   # PIN verification, session token helpers
    db/
      index.ts                # Drizzle client + Neon connection
      schema.ts               # Database schema definition
  middleware.ts               # Route protection for /jam/* and /discover/*
docs/
  architecture.md             # Full system architecture & design document
  deployment.md               # Vercel deployment guide
drizzle/                      # Generated migration metadata
scripts/
  setup-db.sh                 # Database setup script
```

## Architecture Patterns

### Next.js App Router conventions
- Server components are the default; client components use `'use client'` directive
- API routes live in `src/app/api/` following RESTful conventions
- Middleware in `src/middleware.ts` protects `/jam/*` and `/discover/*` routes

### Database
- Single `songs` table with UUID primary keys
- Schema defined in `src/lib/db/schema.ts` using Drizzle ORM
- Type exports: `Song` (select type) and `NewSong` (insert type)
- Database fields use snake_case in PostgreSQL, mapped to camelCase in TypeScript
- Song status enum: `want_to_jam` | `learning` | `can_play` | `nailed_it`
- Difficulty enum: `easy` | `medium` | `hard`

### Authentication
- PIN-based auth (no user accounts) - PIN stored in `JAM_PIN` env var
- Timing-safe comparison to prevent timing attacks
- HMAC-SHA256 signed session tokens stored as httpOnly cookies
- 30-day session expiry
- Middleware uses Web Crypto API for token verification

### Component organization
- Page components in `src/app/` directories
- Container components (`JamList`, `PinEntry`) handle business logic
- Presentational components (`SongCard`, `StatusBadge`) handle display
- Reusable UI primitives in `src/components/ui/`

## Coding Conventions

- **TypeScript strict mode** is enabled - all code must type-check
- **Component files:** PascalCase (e.g., `SongCard.tsx`)
- **Utility files:** camelCase (e.g., `auth.ts`)
- **Database columns:** snake_case in SQL, camelCase in Drizzle/TypeScript
- **Environment variables:** SCREAMING_SNAKE_CASE
- **Path alias:** `@/*` maps to `./src/*` (use `@/components/...`, `@/lib/...`)
- **Styling:** Tailwind CSS utility classes; theme tokens defined in `globals.css` `@theme` block
- **API responses:** JSON format with standard HTTP status codes (200, 201, 400, 401, 404, 500); errors include an `error` field

## Environment Variables

Required variables (see `.env.example`):

```
JAM_PIN=              # 4-8 digit PIN for authentication
SESSION_SECRET=       # Random string for HMAC session signing
DATABASE_URL=         # PostgreSQL connection string (Neon)
```

Optional API keys for integrations:
```
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
YOUTUBE_API_KEY=
LASTFM_API_KEY=
GENIUS_ACCESS_TOKEN=
```

## CI/CD Pipeline

GitHub Actions (`.github/workflows/deploy.yml`) runs on push/PR to `main`:

1. Install dependencies (`pnpm install --frozen-lockfile`)
2. Lint (`pnpm lint`)
3. Type check (`pnpm exec tsc --noEmit`)
4. Run tests with coverage (`pnpm test:coverage`)
5. Upload coverage reports as artifacts
6. Generate coverage summary (PRs only)
7. Build (`pnpm build`)
8. Upload build artifacts (push to main only)

Before pushing changes, verify they pass: `pnpm lint && pnpm exec tsc --noEmit && pnpm test:coverage && pnpm build`

## Testing

The project uses **Vitest** as the test runner with React Testing Library for component testing. Coverage reporting is enabled via `@vitest/coverage-v8`.

### Test Configuration
- **Framework:** Vitest 4.x with jsdom environment
- **React testing:** @testing-library/react for component tests
- **Coverage:** V8 provider with HTML, LCOV, JSON, and text reporters
- **Thresholds:** 80% for lines, functions, branches, and statements
- **Setup file:** `vitest.setup.ts` configures jest-dom matchers
- **Config file:** `vitest.config.ts`

### Running Tests
```bash
pnpm test              # Run all tests once
pnpm test:watch        # Run tests in watch mode
pnpm test:coverage     # Run tests with coverage report
pnpm test:ui           # Run tests with Vitest UI
```

### Writing Tests
- Place test files next to the component being tested (e.g., `StatusBadge.test.tsx` next to `StatusBadge.tsx`)
- Use `.test.tsx` or `.test.ts` extension
- Import from `vitest` for test functions (`describe`, `it`, `expect`)
- Import from `@testing-library/react` for rendering and querying
- Use `@testing-library/jest-dom` matchers (e.g., `toBeInTheDocument()`)

### Coverage Reports
- Coverage reports are generated in the `coverage/` directory
- HTML report: `coverage/index.html`
- LCOV report: `coverage/lcov.info`
- JSON summary: `coverage/coverage-summary.json`
- CI uploads coverage as artifacts and shows summary in PR checks

### Excluded from Coverage
- `node_modules/`, `.next/`, `drizzle/`
- Config files (`*.config.ts`, `*.config.js`)
- Type declaration files (`*.d.ts`)
- Database schema (`src/lib/db/schema.ts`)
- Middleware (`src/middleware.ts`) - tested via integration

## Common Tasks

### Adding a new database column
1. Edit `src/lib/db/schema.ts`
2. Run `pnpm db:generate` to generate a migration
3. Run `pnpm db:migrate` to apply it (or `pnpm db:push` for quick sync)

### Adding a new API endpoint
- Create a `route.ts` file in the appropriate `src/app/api/` directory
- Export named functions matching HTTP methods (`GET`, `POST`, `PATCH`, `DELETE`)
- Return `NextResponse.json()` with appropriate status codes

### Adding a new protected page
- Create a directory under `src/app/` with a `page.tsx`
- Add the route pattern to the `matcher` array in `src/middleware.ts`

### Adding a new UI component
- Reusable primitives go in `src/components/ui/`
- Feature-specific components go in `src/components/`
- Export from `src/components/ui/index.ts` if adding to the UI library
