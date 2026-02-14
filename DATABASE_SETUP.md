# Database Setup Guide

## Problem
You're seeing this error: `relation "songs" does not exist`

This means the database tables haven't been created yet.

## Quick Fix

### Option 1: Using Neon (Recommended for Production)

1. **Get a free database from Neon**
   - Visit https://neon.tech
   - Create a free account and database
   - Copy your connection string

2. **Set up environment variables**
   ```bash
   # Create .env file
   cp .env.example .env

   # Edit .env and set your DATABASE_URL
   # DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
   ```

3. **Push the schema to your database**
   ```bash
   npm run db:push
   ```

### Option 2: Local PostgreSQL (Development)

1. **Start PostgreSQL locally**
   ```bash
   # On macOS with Homebrew
   brew services start postgresql@14

   # On Ubuntu/Debian
   sudo service postgresql start

   # Using Docker
   docker run --name jammy-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=jammy_dev -p 5432:5432 -d postgres:15
   ```

2. **Create the database**
   ```bash
   # If using local PostgreSQL
   createdb jammy_dev

   # Or using psql
   psql -U postgres -c "CREATE DATABASE jammy_dev;"
   ```

3. **Push the schema**
   ```bash
   # No .env needed - drizzle.config.ts uses localhost:5432/jammy_dev as fallback
   npm run db:push
   ```

## Database Commands

- `npm run db:generate` - Generate migration files from schema
- `npm run db:push` - Push schema directly to database (no migration files)
- `npm run db:migrate` - Apply migration files to database
- `npm run db:studio` - Open Drizzle Studio to view/edit data

## Schema Overview

The `songs` table includes:
- Basic info: title, artist, album
- Status tracking: want_to_jam, learning, can_play, nailed_it
- Difficulty ratings for bass and drums
- Integration links: Spotify, YouTube, Songsterr, Genius
- Timestamps and metadata

## Verification

After setup, verify the table exists:
```bash
# If using local PostgreSQL
psql jammy_dev -c "\dt"

# Or run the app
npm run dev
# Visit http://localhost:3000/api/songs
```

## Troubleshooting

**Connection errors?**
- Check DATABASE_URL is set correctly in .env
- Verify PostgreSQL is running: `pg_isready`
- Check firewall/network settings for remote databases

**Migration conflicts?**
- Use `npm run db:push` to sync schema directly
- This is safe for development and will update your tables

**Need to reset?**
- Drop and recreate the database
- Run `npm run db:push` again
