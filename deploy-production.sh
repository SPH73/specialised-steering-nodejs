#!/bin/bash
# Production Deployment Script
# Run this on your production server: ./deploy-production.sh
#
# ⚠️  IMPORTANT: This script uses Passenger for application restarts
#    Make sure you're in the production directory: ~/specialisedsteering.com

set -e  # Exit on error (but we'll handle errors gracefully)

echo "🚀 Starting production deployment..."

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Verify we're in the right directory
if [ ! -f "app.js" ]; then
    echo "❌ Error: app.js not found. Are you in the correct directory?"
    echo "   Expected: ~/specialisedsteering.com"
    exit 1
fi

# Set Node.js PATH (required for npm to work on this server)
export PATH=~/nodevenv/specialisedsteering.com/20/bin:$PATH

# Verify Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js not found in PATH"
    echo "   Tried: ~/nodevenv/specialisedsteering.com/20/bin/node"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Confirm we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  Warning: Not on main branch. Current branch: $CURRENT_BRANCH"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi

# Backup .env file (if it exists - production may use .htaccess instead)
if [ -f .env ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ .env backed up"
fi

# Backup .htaccess (contains environment variables on production)
# IMPORTANT: .htaccess is in .gitignore, so git will NEVER overwrite it
if [ -f .htaccess ]; then
    cp .htaccess .htaccess.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ .htaccess backed up"

    # Verify NOTIFICATION_EMAIL is set in .htaccess (production email config)
    if grep -q "SetEnv NOTIFICATION_EMAIL" .htaccess; then
        NOTIFICATION_EMAIL=$(grep "SetEnv NOTIFICATION_EMAIL" .htaccess | head -1 | sed 's/.*SetEnv NOTIFICATION_EMAIL[[:space:]]*//')
        echo "   ℹ️  Production NOTIFICATION_EMAIL found in .htaccess: $NOTIFICATION_EMAIL"
    else
        echo "   ⚠️  Warning: NOTIFICATION_EMAIL not found in .htaccess"
    fi
else
    echo "⚠️  Warning: .htaccess not found (may use .env file instead)"
fi

# Fetch latest changes
echo "📥 Fetching latest changes from GitHub..."
if ! git fetch origin; then
    echo "❌ Error: Failed to fetch from origin"
    exit 1
fi

# Check if there are changes to pull
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})
if [ "$LOCAL" = "$REMOTE" ]; then
    echo "ℹ️  Already up to date with origin/main"
else
    echo "📦 Pulling from main branch..."
    if ! git pull origin main; then
        echo "❌ Error: Failed to pull changes. There may be conflicts."
        echo "   Please resolve conflicts manually and try again."
        exit 1
    fi
fi

# Restore .env file (don't overwrite with repo version)
LATEST_ENV_BACKUP=$(ls -t .env.backup.* 2>/dev/null | head -1)
if [ -n "$LATEST_ENV_BACKUP" ] && [ -f "$LATEST_ENV_BACKUP" ]; then
    mv "$LATEST_ENV_BACKUP" .env
    echo "✅ .env restored from backup"
fi

# Install/update dependencies
echo "📦 Installing dependencies..."
if ! npm install --omit=dev; then
    echo "❌ Error: npm install failed"
    echo "   Please check the error messages above and fix any issues."
    exit 1
fi

# Verify npm install succeeded
if [ ! -d "node_modules" ] && [ ! -L "node_modules" ]; then
    echo "⚠️  Warning: node_modules not found after npm install"
    echo "   This might be okay if using symlink to nodevenv"
fi

# Restart Passenger application
echo "🔄 Restarting Passenger application..."
mkdir -p tmp
if ! touch tmp/restart.txt; then
    echo "❌ Error: Failed to create restart file"
    exit 1
fi

echo "✅ Restart file created (Passenger will restart automatically)"

# Wait a moment for Passenger to detect the restart file
sleep 2

echo ""
echo "✅ Production deployment complete!"
echo "📍 Current branch: $(git branch --show-current)"
echo "📍 Latest commit: $(git log -1 --oneline)"
echo ""

# Verify .htaccess is still intact (wasn't overwritten by git)
if [ -f .htaccess ]; then
    if grep -q "SetEnv NOTIFICATION_EMAIL" .htaccess; then
        NOTIFICATION_EMAIL=$(grep "SetEnv NOTIFICATION_EMAIL" .htaccess | head -1 | sed 's/.*SetEnv NOTIFICATION_EMAIL[[:space:]]*//')
        echo "✅ Production email settings preserved:"
        echo "   NOTIFICATION_EMAIL: $NOTIFICATION_EMAIL"
    fi
    echo "✅ .htaccess preserved (git does not modify files in .gitignore)"
else
    echo "⚠️  .htaccess not found - using .env file for environment variables"
fi

echo ""
echo "📋 Next steps:"
echo "   1. Monitor logs: tail -f stderr.log"
echo "   2. Test the site: https://www.specialisedsteering.com"
echo "   3. Verify gallery: https://www.specialisedsteering.com/gallery"
echo "   4. Verify email notifications use production address"

