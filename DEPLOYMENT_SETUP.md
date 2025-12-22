# Git Deployment Setup Guide

## Overview

This guide will help you set up `git pull` deployment on your Namecheap server for both staging (`staging.specialisedsteering.com`) and production (`specialisedsteering.com`).

## Prerequisites

- SSH access to your Namecheap server
- Git repository: `git@github.com:SPH73/specialised-steering-nodejs.git`
- Access to cPanel or SSH terminal

## Step 1: SSH into Your Server

1. Connect via SSH to your Namecheap server:

   ```bash
   ssh your-username@staging.specialisedsteering.com
   # or
   ssh your-username@specialisedsteering.com
   ```

2. Navigate to your website's root directory (usually `public_html` or `staging.specialisedsteering.com`):

   ```bash
   cd ~/public_html
   # or for staging
   cd ~/staging.specialisedsteering.com
   ```

## Step 2: Set Up Git on the Server

### 2.1 Install Git (if not already installed)

```bash
# Check if git is installed
git --version

# If not installed, install it (varies by server OS)
# For most shared hosting, git should already be available
```

### 2.2 Generate SSH Key for Server (if needed)

If you need to set up SSH keys for GitHub:

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "server-deployment-key" -f ~/.ssh/github_deploy

# Display the public key
cat ~/.ssh/github_deploy.pub
```

Add this public key to your GitHub repository:

1. Go to GitHub → Your Repository → Settings → Deploy keys
2. Click "Add deploy key"
3. Paste the public key and give it a name (e.g., "Namecheap Server")
4. **Important:** Don't check "Allow write access" (read-only is safer)

### 2.3 Clone Repository (First Time Setup)

**For Staging:**

```bash
cd ~/staging.specialisedsteering.com
git clone git@github.com:SPH73/specialised-steering-nodejs.git .
# The `.` at the end clones into current directory
```

**For Production:**

```bash
cd ~/public_html
git clone git@github.com:SPH73/specialised-steering-nodejs.git .
```

**Note:** If the directory already has files, you may need to:

```bash
# Backup existing files first
cd ~/staging.specialisedsteering.com
mv .env .env.backup  # Backup your .env file
git init
git remote add origin git@github.com:SPH73/specialised-steering-nodejs.git
git fetch origin
git checkout -b main origin/main
# Restore .env
mv .env.backup .env
```

## Step 3: Configure Git on Server

```bash
# Set git config (if not already set)
git config user.name "Server Deployment"
git config user.email "your-email@example.com"

# Set default branch
git config init.defaultBranch main
```

## Step 4: Create Deployment Scripts

Create deployment scripts on your server for easy updates.

### For Staging (`deploy-staging.sh`)

```bash
#!/bin/bash
# Staging Deployment Script
# Location: ~/staging.specialisedsteering.com/deploy-staging.sh

set -e  # Exit on error

echo "🚀 Starting staging deployment..."

# Navigate to staging directory
cd ~/staging.specialisedsteering.com

# Backup .env file
if [ -f .env ]; then
    cp .env .env.backup
    echo "✅ .env backed up"
fi

# Fetch latest changes
echo "📥 Fetching latest changes from GitHub..."
git fetch origin

# Pull latest changes (use specific branch if needed)
BRANCH=${1:-main}  # Use branch argument or default to main
echo "📦 Pulling from branch: $BRANCH"
git pull origin $BRANCH

# Restore .env file (don't overwrite with repo version)
if [ -f .env.backup ]; then
    mv .env.backup .env
    echo "✅ .env restored"
fi

# Install/update dependencies
echo "📦 Installing dependencies..."
npm install --production

# Restart application (adjust based on your setup)
# If using PM2:
# pm2 restart specialised-steering-staging

# If using a process manager, restart it here
echo "🔄 Restarting application..."
# Add your restart command here

echo "✅ Staging deployment complete!"
```

### For Production (`deploy-production.sh`)

```bash
#!/bin/bash
# Production Deployment Script
# Location: ~/public_html/deploy-production.sh

set -e  # Exit on error

echo "🚀 Starting production deployment..."

# Navigate to production directory
cd ~/public_html

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
# Add your restart command here

echo "✅ Production deployment complete!"
```

### Make Scripts Executable

```bash
chmod +x ~/staging.specialisedsteering.com/deploy-staging.sh
chmod +x ~/public_html/deploy-production.sh
```

## Step 5: Deployment Workflow

### Manual Deployment

**Deploy to Staging:**

```bash
ssh your-username@staging.specialisedsteering.com
cd ~/staging.specialisedsteering.com
./deploy-staging.sh
# Or pull specific branch:
./deploy-staging.sh feat/critical-fixes-and-email-notifications
```

**Deploy to Production:**

```bash
ssh your-username@specialisedsteering.com
cd ~/public_html
./deploy-production.sh
```

### Recommended Workflow

1. **Develop locally** on a feature branch
2. **Test locally** with `npm start`
3. **Commit and push** to GitHub
4. **Deploy to staging** to test on server
5. **Merge to main** when ready
6. **Deploy to production** from main branch

## Step 6: Environment-Specific Configuration

### Staging Environment

Your staging `.env` should have:

```env
# Staging-specific settings
NODE_ENV=staging
PORT=3300
# ... other staging config
```

### Production Environment

Your production `.env` should have:

```env
# Production-specific settings
NODE_ENV=production
PORT=3300
# ... other production config
```

**Important:** Never commit `.env` files to git. They should remain on the server only.

## Step 7: Handling Node.js Process Management

Since you're using Node.js, you'll need to manage the process. Options:

### Option A: PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start app.js --name specialised-steering-staging

# Save PM2 configuration
pm2 save
pm2 startup  # Follow instructions to auto-start on reboot
```

Update deployment scripts to restart PM2:

```bash
pm2 restart specialised-steering-staging
```

### Option B: cPanel Node.js App

If using cPanel's Node.js app manager:

1. Go to cPanel → Node.js App
2. Configure your app
3. Restart from cPanel after deployment

### Option C: Simple Process Manager

Create a simple restart script:

```bash
# kill existing process and restart
pkill -f "node app.js"
nohup node app.js > app.log 2>&1 &
```

## Step 8: Troubleshooting

### Git Pull Fails with "Permission Denied"

```bash
# Check SSH key
ssh -T git@github.com

# If fails, add SSH key to ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/github_deploy
```

### Local Changes Conflict

```bash
# Stash local changes (be careful!)
git stash
git pull origin main
git stash pop
```

### .env File Gets Overwritten

The deployment scripts backup and restore `.env`, but if issues occur:

```bash
# Restore from backup
cp .env.backup .env
```

### Node Modules Issues

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install --production
```

## Step 9: Security Best Practices

1. **Use deploy keys** (read-only) instead of personal SSH keys
2. **Never commit** `.env` files
3. **Use different** `.env` files for staging and production
4. **Restrict SSH access** to your IP if possible
5. **Keep dependencies updated** with `npm audit`

## Step 10: Quick Reference Commands

```bash
# Check current branch
git branch

# Check status
git status

# Pull latest changes
git pull origin main

# Pull specific branch
git pull origin feat/critical-fixes-and-email-notifications

# View commit history
git log --oneline -10

# Check remote
git remote -v
```

## Next Steps

1. Set up SSH access to your server
2. Clone repository on staging server
3. Test deployment script on staging
4. Set up production deployment
5. Test full workflow: local → staging → production

## Support

If you encounter issues:

- Check server logs: `tail -f app.log` or PM2 logs
- Verify Node.js version: `node --version` (should match local)
- Check file permissions: `ls -la`
- Verify environment variables: `cat .env` (be careful with sensitive data)
