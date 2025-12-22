#!/bin/bash
# Production Deployment Script
# Run this on your production server: ./deploy-production.sh

set -e  # Exit on error

echo "🚀 Starting production deployment..."

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

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

# Backup .env file
if [ -f .env ]; then
    cp .env .env.backup
    echo "✅ .env backed up"
fi

# Fetch latest changes
echo "📥 Fetching latest changes from GitHub..."
git fetch origin

# Pull latest changes from main branch
echo "📦 Pulling from main branch..."
git pull origin main

# Restore .env file
if [ -f .env.backup ]; then
    mv .env.backup .env
    echo "✅ .env restored"
fi

# Install/update dependencies
echo "📦 Installing dependencies..."
npm install --production

# Restart application
echo "🔄 Restarting application..."
# If using PM2, uncomment:
# pm2 restart specialised-steering-production

# If using other process manager, add restart command here
# Example: pkill -f "node app.js" && nohup node app.js > app.log 2>&1 &

echo "✅ Production deployment complete!"
echo "📍 Current branch: $(git branch --show-current)"
echo "📍 Latest commit: $(git log -1 --oneline)"

