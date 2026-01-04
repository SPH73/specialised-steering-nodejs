#!/bin/bash
# Staging Deployment Script
# Run this on your staging server: ./deploy-staging.sh [branch-name]

set -e  # Exit on error

echo "🚀 Starting staging deployment..."

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Backup .env file
if [ -f .env ]; then
    cp .env .env.backup
    echo "✅ .env backed up"
fi

# Fetch latest changes
echo "📥 Fetching latest changes from GitHub..."
git fetch origin

# Pull latest changes (use branch argument or default to main)
BRANCH=${1:-main}  # Use branch argument or default to main
echo "📦 Pulling from branch: $BRANCH"
git pull origin "$BRANCH"

# Restore .env file (don't overwrite with repo version)
if [ -f .env.backup ]; then
    mv .env.backup .env
    echo "✅ .env restored"
fi

# Install/update dependencies
echo "📦 Installing dependencies..."
npm install --omit=dev

# Restart application (adjust based on your setup)
echo "🔄 Restarting application..."
# If using PM2, uncomment:
# pm2 restart specialised-steering-staging

# If using other process manager, add restart command here
# Example: pkill -f "node app.js" && nohup node app.js > app.log 2>&1 &

echo "✅ Staging deployment complete!"
echo "📍 Current branch: $(git branch --show-current)"
echo "📍 Latest commit: $(git log -1 --oneline)"

