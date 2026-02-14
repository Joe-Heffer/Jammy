# Deployment Guide

This guide explains how to deploy Jammy to Vercel with automatic deployment from GitHub.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Vercel Setup](#vercel-setup)
- [Environment Variables](#environment-variables)
- [Automatic Deployment with GitHub Actions](#automatic-deployment-with-github-actions)
- [Manual Deployment](#manual-deployment)
- [Database Configuration](#database-configuration)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- A [Vercel account](https://vercel.com/signup) (free tier works)
- A [GitHub account](https://github.com) with this repository
- Node.js 20+ installed locally (for testing)
- pnpm installed (`npm install -g pnpm`)
- API keys for music services:
  - [Spotify](https://developer.spotify.com/dashboard) (Client ID & Secret)
  - [YouTube](https://console.cloud.google.com/) (API Key)
  - [Last.fm](https://www.last.fm/api/account/create) (API Key)
  - [Genius](https://genius.com/api-clients) (Access Token)

## Vercel Setup

### 1. Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Vercel will automatically detect Next.js configuration

### 2. Configure Build Settings

Vercel should auto-detect these settings from `vercel.json`:

- **Framework Preset:** Next.js
- **Build Command:** `pnpm run build`
- **Install Command:** `pnpm install`
- **Output Directory:** `.next` (auto-detected)
- **Node Version:** 20.x

### 3. Get Vercel Credentials

For GitHub Actions deployment, you'll need:

#### Vercel Token
1. Go to [Vercel Account Settings → Tokens](https://vercel.com/account/tokens)
2. Click **"Create Token"**
3. Name it (e.g., "GitHub Actions Deploy")
4. Set expiration (recommend 1 year or no expiration for CI/CD)
5. Copy the token (you won't see it again)

#### Vercel Project ID
1. Go to your project's **Settings** tab in Vercel
2. Scroll to **General** section
3. Copy **Project ID**

#### Vercel Organization ID
1. Go to [Vercel Account Settings → General](https://vercel.com/account)
2. Under **Your ID**, copy the **Team/User ID**

## Environment Variables

### Required Environment Variables

Add these in Vercel Dashboard → Your Project → Settings → Environment Variables:

```bash
# Authentication
JAM_PIN=your-secure-pin-here
SESSION_SECRET=your-random-secret-key-here

# Database (Production - Neon PostgreSQL recommended)
DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# Spotify API
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret

# YouTube API
YOUTUBE_API_KEY=your-youtube-api-key

# Last.fm API
LASTFM_API_KEY=your-lastfm-api-key

# Genius API
GENIUS_ACCESS_TOKEN=your-genius-access-token
```

### Environment Variable Setup Steps

1. In Vercel Dashboard, go to your project
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable one by one:
   - **Key:** Variable name (e.g., `JAM_PIN`)
   - **Value:** Your secret value
   - **Environment:** Select **Production**, **Preview**, and **Development** as needed
4. Click **"Save"**

### Generating Secure Secrets

For `SESSION_SECRET`, generate a random string:

```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 32

# Option 3: Using /dev/urandom (Linux/Mac)
head -c 32 /dev/urandom | base64
```

## Automatic Deployment with GitHub Actions

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically:

- Runs on every push to `main`/`master` branch
- Installs dependencies and builds the project
- Runs linting and type checking
- Deploys to Vercel production
- Uploads build artifacts

### Setting Up GitHub Actions

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"** for each:

   | Secret Name | Value | Where to Get It |
   |-------------|-------|-----------------|
   | `VERCEL_TOKEN` | Your Vercel token | [Vercel Tokens](https://vercel.com/account/tokens) |
   | `VERCEL_ORG_ID` | Your organization ID | [Vercel Account Settings](https://vercel.com/account) |
   | `VERCEL_PROJECT_ID` | Your project ID | Vercel Project Settings → General |

4. Click **"Add secret"** for each one

### How Automatic Deployment Works

```
┌─────────────────────┐
│  Push to main/master │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  GitHub Actions     │
│  - Checkout code    │
│  - Setup Node/pnpm  │
│  - Install deps     │
│  - Run linter       │
│  - Type check       │
│  - Build project    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Deploy to Vercel   │
│  (Production)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Live on Vercel! 🎉 │
└─────────────────────┘
```

### Workflow Features

- **Pull Request Previews:** Automatically creates preview deployments for PRs
- **Quality Checks:** Runs ESLint and TypeScript type checking before deployment
- **Build Artifacts:** Saves `.next` build directory for debugging (7-day retention)
- **Production Deployment:** Only deploys to production on `main`/`master` push

## Manual Deployment

### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Option 2: Git Push (if auto-deploy enabled)

```bash
# Commit your changes
git add .
git commit -m "Your commit message"

# Push to main (triggers auto-deployment)
git push origin main
```

### Option 3: Vercel Dashboard

1. Go to your project in Vercel Dashboard
2. Click **"Deployments"** tab
3. Click **"Redeploy"** on any previous deployment
4. Or connect GitHub and enable **"Git Integration"**

## Database Configuration

### Production Database Setup (Neon PostgreSQL)

1. Create a [Neon](https://neon.tech) account (recommended free PostgreSQL)
2. Create a new project
3. Copy the connection string (format: `postgresql://...`)
4. Add to Vercel environment variables as `DATABASE_URL`

### Running Migrations on Production

```bash
# Set production database URL locally
export DATABASE_URL="postgresql://..."

# Generate migration files (if schema changed)
pnpm run db:generate

# Apply migrations to production database
pnpm run db:migrate
```

### Database Schema

The application uses Drizzle ORM with these scripts:

- `pnpm run db:generate` - Generate migration files from schema
- `pnpm run db:migrate` - Apply migrations to database
- `pnpm run db:push` - Push schema changes directly (dev only)
- `pnpm run db:studio` - Open Drizzle Studio UI

### Local vs Production Databases

- **Local Development:** Uses SQLite (`.db` file)
- **Production:** Uses PostgreSQL via Neon (or other PostgreSQL provider)
- **Configuration:** Set `DATABASE_URL` environment variable to use PostgreSQL

## Post-Deployment

### Verify Deployment

1. Check deployment status in Vercel Dashboard
2. Visit your production URL (e.g., `https://your-project.vercel.app`)
3. Test core functionality:
   - PIN authentication
   - Music search (Spotify, YouTube, Last.fm)
   - Playlist creation
   - Lyrics fetching (Genius)

### Monitor Application

- **Vercel Dashboard:** View logs, analytics, and performance metrics
- **Runtime Logs:** Vercel → Your Project → Logs
- **Build Logs:** Vercel → Your Project → Deployments → [Build] → Build Logs

### Custom Domain Setup

1. In Vercel Dashboard, go to your project
2. Navigate to **Settings** → **Domains**
3. Click **"Add Domain"**
4. Enter your custom domain (e.g., `jammy.example.com`)
5. Follow DNS configuration instructions
6. Wait for DNS propagation (can take up to 48 hours)

## Troubleshooting

### Build Failures

**Error: "pnpm: command not found"**
- Ensure `installCommand` is set to `pnpm install` in `vercel.json`

**Error: Type checking failed**
```bash
# Run locally to see errors
pnpm run build
# Fix TypeScript errors before deploying
```

**Error: Environment variable missing**
- Check all required variables are set in Vercel Dashboard
- Ensure they're set for the correct environment (Production/Preview/Development)

### Deployment Failures

**GitHub Actions failing with 403 error**
- Verify `VERCEL_TOKEN` is valid and not expired
- Check `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` are correct
- Ensure Vercel token has deployment permissions

**Deployment succeeds but site doesn't work**
- Check runtime logs in Vercel Dashboard
- Verify all environment variables are set correctly
- Check database connection (try connecting from local with production `DATABASE_URL`)

### Database Issues

**Error: "Cannot connect to database"**
- Verify `DATABASE_URL` is set correctly
- For Neon: Ensure connection string includes `?sslmode=require`
- Check database is accessible from Vercel's network

**Error: "relation does not exist"**
- Run migrations on production database:
  ```bash
  export DATABASE_URL="postgresql://..."
  pnpm run db:migrate
  ```

### API Integration Issues

**Spotify/YouTube/Last.fm/Genius not working**
- Verify all API keys are set correctly in environment variables
- Check API key quotas and limits
- Ensure API keys are enabled for production domains
- For Spotify: Add Vercel domain to redirect URIs if using OAuth

### Performance Issues

**Slow page loads**
- Enable Vercel Analytics to identify bottlenecks
- Check for large dependencies in bundle
- Review Next.js build output for warnings
- Consider enabling Edge Runtime for specific routes

**Image loading issues**
- Verify `next.config.ts` has correct image domains configured
- Check Spotify CDN domains (`i.scdn.co`, `*.spotifycdn.com`) are allowed

### Getting Help

- **Vercel Documentation:** https://vercel.com/docs
- **Next.js Documentation:** https://nextjs.org/docs
- **GitHub Issues:** Open an issue in the repository
- **Vercel Support:** Available for Pro/Enterprise plans

## Additional Resources

- [Vercel Deployment Documentation](https://vercel.com/docs/deployments/overview)
- [Next.js Deployment Guide](https://nextjs.org/docs/app/building-your-application/deploying)
- [GitHub Actions Vercel Action](https://github.com/amondnet/vercel-action)
- [Neon PostgreSQL Documentation](https://neon.tech/docs/introduction)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
