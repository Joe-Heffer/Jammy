# Database Migration with GitHub Actions

This guide explains how to set up and run database migrations using GitHub Actions.

## Setup GitHub Secret

1. **Get your Vercel Postgres connection string**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Navigate to your project → **Storage** → **Postgres**
   - Click on the **".env.local"** tab
   - Copy the `DATABASE_URL` value

2. **Add the secret to GitHub**:
   - Go to your GitHub repository: https://github.com/Joe-Heffer/Jammy
   - Navigate to **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `DATABASE_URL`
   - Value: Paste your Vercel Postgres connection string
   - Click **Add secret**

## Running the Migration

### Option 1: Manual Trigger (Recommended for first run)

1. Go to the **Actions** tab in your GitHub repository
2. Select **Database Migration** from the workflow list
3. Click **Run workflow** button
4. Select the branch (usually `main`)
5. Click **Run workflow**

The workflow will:
- ✅ Install dependencies
- ✅ Apply the database schema (create the `songs` table)
- ✅ Show success message

### Option 2: Automatic on Push

The workflow automatically runs when you push changes to:
- `src/lib/db/schema.ts` (schema changes)
- `drizzle/**` (migration files)
- `.github/workflows/db-migrate.yml` (workflow itself)

## Verifying Success

After the workflow completes:

1. Check the workflow run logs for "✅ Database schema applied successfully"
2. Verify in Vercel Postgres dashboard that the `songs` table exists
3. Your Next.js app should now work without the "relation songs does not exist" error

## Troubleshooting

### Error: "DATABASE_URL secret not found"
- Make sure you've added the `DATABASE_URL` secret to GitHub repository settings
- The secret name must be exactly `DATABASE_URL` (case-sensitive)

### Error: "Connection failed"
- Verify your Vercel Postgres connection string is correct
- Ensure your Vercel Postgres database is active and accessible
- Check that the connection string includes `?sslmode=require` at the end

### Error: "pnpm db:push failed"
- Check the workflow logs for specific error messages
- Verify the schema file at `src/lib/db/schema.ts` is valid
- Ensure you have the latest version of drizzle-kit installed

## Local Development

For local development with your Vercel database:

1. Create `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```

2. Add your DATABASE_URL to `.env.local`:
   ```bash
   DATABASE_URL=postgresql://username:password@ep-xxxxx.us-east-1.postgres.vercel-storage.com/verceldb?sslmode=require
   ```

3. Apply schema locally:
   ```bash
   pnpm db:push
   ```

## Security Notes

- ✅ Never commit `.env.local` or `.env` files to git
- ✅ Always use GitHub secrets for sensitive credentials
- ✅ Rotate your database credentials if they're accidentally exposed
- ✅ Keep your Vercel Postgres connection string secure
