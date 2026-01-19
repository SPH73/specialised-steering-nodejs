#!/bin/bash
# Upload .htaccess to Production Script
# Run this from your local repository root: ./upload-htaccess-to-production.sh

set -e  # Exit on error

echo "📤 Uploading .htaccess to production..."

# Verify .htaccess exists locally
if [ ! -f ".htaccess" ]; then
    echo "❌ Error: .htaccess file not found in current directory"
    echo "   Please run this script from the repository root"
    exit 1
fi

# Production server details (loaded from .env)
if [ -f ".env" ]; then
    # shellcheck disable=SC1091
    source .env
fi

if [ -z "$PROD_HOST" ] || [ -z "$PROD_PORT" ] || [ -z "$PROD_USER" ] || [ -z "$PROD_DIR" ]; then
    echo "❌ Error: Missing production connection details."
    echo "   Please set PROD_HOST, PROD_PORT, PROD_USER, PROD_DIR in .env"
    exit 1
fi

# Create backup on production server first
echo "📦 Creating backup of existing .htaccess on production..."
ssh -p $PROD_PORT $PROD_USER@$PROD_HOST "cd $PROD_DIR && cp .htaccess .htaccess.backup.\$(date +%Y%m%d_%H%M%S) && echo '✅ Backup created'"

# Upload .htaccess to production
echo "📤 Uploading .htaccess to production..."
scp -P $PROD_PORT .htaccess $PROD_USER@$PROD_HOST:$PROD_DIR/.htaccess

if [ $? -eq 0 ]; then
    echo "✅ .htaccess uploaded successfully"
    echo ""
    echo "⚠️  IMPORTANT: Restart Passenger to apply changes:"
    echo "   ssh -p $PROD_PORT $PROD_USER@$PROD_HOST \"cd $PROD_DIR && touch tmp/restart.txt\""
    echo ""
    echo "Or run the restart command now? (y/N)"
    read -p "> " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔄 Restarting Passenger..."
        ssh -p $PROD_PORT $PROD_USER@$PROD_HOST "cd $PROD_DIR && touch tmp/restart.txt"
        echo "✅ Passenger restart triggered"
        echo ""
        echo "⏳ Wait 10-15 seconds for Passenger to restart, then test:"
        echo "   https://www.specialisedsteering.com"
    fi
else
    echo "❌ Error: Failed to upload .htaccess"
    exit 1
fi

echo ""
echo "✅ Done!"
