# Jammy
Music jam session playlist planner and music exploration app.

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database (get a free one at [Neon](https://neon.tech))

### Setup

1. Clone the repository and install dependencies:
   ```bash
   pnpm install
   ```

2. Set up your environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. **Important:** Edit `.env.local` and set your `DATABASE_URL` to a valid PostgreSQL connection string. The app requires PostgreSQL (Neon) for both development and production.

   Example:
   ```
   DATABASE_URL=postgresql://user:password@host.neon.tech/jammy?sslmode=require
   ```

4. Run database migrations:
   ```bash
   pnpm db:push
   # or using npm
   npm run db:push
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

### Database

This app uses PostgreSQL (Neon) with Drizzle ORM. The database connection is required for the app to function.

- **Schema**: `src/lib/db/schema.ts`
- **Database client**: `src/lib/db/index.ts`
- **Migrations**: Run `pnpm db:push` to sync schema changes

**Troubleshooting?** See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed setup instructions, local PostgreSQL setup, and common issues.

### API Endpoints

- `GET /api/songs` - List all songs with optional filtering
- `POST /api/songs` - Create a new song
- `GET /api/songs/[id]` - Get a specific song
- `PATCH /api/songs/[id]` - Update a song
- `DELETE /api/songs/[id]` - Delete a song
