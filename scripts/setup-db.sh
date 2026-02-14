#!/bin/bash
# Database Setup Script for Jammy

set -e

echo "🎸 Jammy Database Setup"
echo "======================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found"
    echo ""
    echo "Choose your setup method:"
    echo "1) Use Neon (cloud, recommended for production)"
    echo "2) Use local PostgreSQL"
    echo ""
    read -p "Enter choice (1 or 2): " choice

    case $choice in
        1)
            echo ""
            echo "📝 Neon Setup:"
            echo "1. Visit https://neon.tech and create a free database"
            echo "2. Copy your connection string"
            echo "3. Create .env file:"
            echo "   cp .env.example .env"
            echo "4. Add your DATABASE_URL to .env"
            echo "5. Run this script again"
            exit 0
            ;;
        2)
            echo ""
            echo "🐘 Local PostgreSQL Setup:"

            # Check if PostgreSQL is installed
            if ! command -v psql &> /dev/null; then
                echo "❌ PostgreSQL not found. Please install it:"
                echo ""
                echo "macOS: brew install postgresql@15"
                echo "Ubuntu: sudo apt install postgresql"
                echo "Docker: docker run --name jammy-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=jammy_dev -p 5432:5432 -d postgres:15"
                exit 1
            fi

            # Check if PostgreSQL is running
            if ! pg_isready -h localhost -p 5432 &> /dev/null; then
                echo "❌ PostgreSQL is not running. Start it with:"
                echo ""
                echo "macOS: brew services start postgresql@15"
                echo "Ubuntu: sudo service postgresql start"
                exit 1
            fi

            # Create database if it doesn't exist
            echo "Creating database jammy_dev..."
            if createdb jammy_dev 2>/dev/null; then
                echo "✅ Database created"
            else
                echo "⚠️  Database might already exist (this is ok)"
            fi

            # Note: drizzle.config.ts already has fallback to localhost:5432/jammy_dev
            echo "✅ Using local database at postgresql://localhost:5432/jammy_dev"
            ;;
        *)
            echo "Invalid choice"
            exit 1
            ;;
    esac
fi

# Push schema to database
echo ""
echo "📊 Pushing schema to database..."
if npm run db:push; then
    echo ""
    echo "✅ Database setup complete!"
    echo ""
    echo "You can now:"
    echo "  - Run the app: npm run dev"
    echo "  - View data: npm run db:studio"
    echo "  - Check tables: psql jammy_dev -c '\dt'"
else
    echo ""
    echo "❌ Schema push failed. Check your DATABASE_URL and try again."
    echo "See DATABASE_SETUP.md for detailed instructions."
    exit 1
fi
