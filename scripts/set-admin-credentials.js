#!/usr/bin/env node
/**
 * Script to set or update admin credentials in .env file
 * Usage: node scripts/set-admin-credentials.js [username] [password]
 * 
 * If no arguments provided, prompts for credentials interactively
 * If arguments provided, sets them directly
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

const ENV_FILE = path.join(__dirname, '..', '.env');

// Create readline interface for interactive input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function readEnvFile() {
  if (!fs.existsSync(ENV_FILE)) {
    return '';
  }
  return fs.readFileSync(ENV_FILE, 'utf8');
}

function writeEnvFile(content) {
  fs.writeFileSync(ENV_FILE, content, 'utf8');
  console.log(`✅ Credentials updated in ${ENV_FILE}`);
}

function updateEnvCredentials(username, password) {
  let envContent = readEnvFile();
  
  // Remove existing ADMIN_USERNAME and ADMIN_PASSWORD lines
  envContent = envContent
    .split('\n')
    .filter(line => !line.trim().startsWith('ADMIN_USERNAME=') && !line.trim().startsWith('ADMIN_PASSWORD='))
    .join('\n');
  
  // Trim trailing newlines and add credentials
  envContent = envContent.trim();
  if (envContent && !envContent.endsWith('\n')) {
    envContent += '\n';
  }
  
  // Add new credentials
  envContent += `ADMIN_USERNAME=${username}\n`;
  envContent += `ADMIN_PASSWORD=${password}\n`;
  
  writeEnvFile(envContent);
}

function generateRandomPassword() {
  return crypto.randomBytes(16).toString('hex');
}

async function main() {
  let username, password;
  
  // Check if credentials provided as arguments
  if (process.argv.length >= 4) {
    username = process.argv[2];
    password = process.argv[3];
  } else if (process.argv.length === 3) {
    // Only username provided, generate random password
    username = process.argv[2];
    password = generateRandomPassword();
    console.log(`🔑 Generated random password: ${password}`);
  } else {
    // Interactive mode
    console.log('🔐 Admin Credentials Setup');
    console.log('='.repeat(50));
    console.log('');
    
    username = await question('Enter admin username (or press Enter for "admin"): ');
    if (!username.trim()) {
      username = 'admin';
    }
    
    const useRandom = await question('Generate random password? (y/n, default: y): ');
    if (!useRandom.trim() || useRandom.toLowerCase() === 'y') {
      password = generateRandomPassword();
      console.log(`🔑 Generated random password: ${password}`);
    } else {
      password = await question('Enter admin password: ');
      if (!password.trim()) {
        console.error('❌ Password cannot be empty');
        rl.close();
        process.exit(1);
      }
    }
  }
  
  if (!username || !password) {
    console.error('❌ Username and password are required');
    rl.close();
    process.exit(1);
  }
  
  updateEnvCredentials(username, password);
  
  console.log('');
  console.log('✅ Admin credentials configured:');
  console.log(`   Username: ${username}`);
  console.log(`   Password: ${password.substring(0, 8)}...`);
  console.log('');
  console.log('📝 Note: Restart your server for changes to take effect');
  console.log('');
  console.log('🔒 Security reminder: Update these credentials before deploying to production!');
  
  rl.close();
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  rl.close();
  process.exit(1);
});

