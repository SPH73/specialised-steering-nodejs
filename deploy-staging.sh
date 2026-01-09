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

# Set Node.js PATH (required for npm to work on this server)
export PATH=~/nodevenv/staging.specialisedsteering.com/20/bin:$PATH

# Verify Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js not found in PATH"
    echo "   Expected path: ~/nodevenv/staging.specialisedsteering.com/20/bin/node"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install/update dependencies
echo "📦 Installing dependencies..."
npm install --omit=dev

# Restart Passenger application
echo "🔄 Restarting Passenger application..."
mkdir -p tmp
touch tmp/restart.txt
echo "✅ Restart file created (Passenger will restart automatically)"

echo "✅ Staging deployment complete!"
echo "📍 Current branch: $(git branch --show-current)"
echo "📍 Latest commit: $(git log -1 --oneline)"

