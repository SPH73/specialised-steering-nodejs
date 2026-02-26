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
  const lines = envContent.split('\n');
  const filteredLines = lines.filter(line => 
    !line.trim().startsWith('ADMIN_USERNAME=') && 
    !line.trim().startsWith('ADMIN_PASSWORD=')
  );
  
  // Find if Admin section exists
  let adminSectionIndex = -1;
  let insertIndex = -1;
  
  for (let i = 0; i < filteredLines.length; i++) {
    const line = filteredLines[i].trim();
    // Check for Admin section comment (various formats)
    if (line.match(/^#\s*Admin/i) || line.match(/^#\s*Admin\s+Configuration/i) || line.match(/^#\s*Admin\s+Authentication/i)) {
      adminSectionIndex = i;
      insertIndex = i + 1;
      // Find the end of the Admin section (next section comment or end of file)
      for (let j = i + 1; j < filteredLines.length; j++) {
        if (filteredLines[j].trim().startsWith('#') && 
            !filteredLines[j].trim().match(/^#\s*Admin/i)) {
          insertIndex = j;
          break;
        }
      }
      if (insertIndex === i + 1) {
        // No other section found, insert at end of Admin section
        insertIndex = filteredLines.length;
      }
      break;
    }
  }
  
  // If no Admin section exists, find a good place to add it (after reCAPTCHA or at end)
  if (adminSectionIndex === -1) {
    let recaptchaIndex = -1;
    for (let i = filteredLines.length - 1; i >= 0; i--) {
      if (filteredLines[i].trim().match(/^#\s*.*[Rr][Ee][Cc][Aa][Pp][Tt][Cc][Hh][Aa]/)) {
        recaptchaIndex = i;
        break;
      }
    }
    
    // Find end of reCAPTCHA section
    if (recaptchaIndex !== -1) {
      for (let i = recaptchaIndex + 1; i < filteredLines.length; i++) {
        if (filteredLines[i].trim().startsWith('#') && 
            !filteredLines[i].trim().match(/^#\s*.*[Rr][Ee][Cc][Aa][Pp][Tt][Cc][Hh][Aa]/)) {
          insertIndex = i;
          break;
        }
      }
      if (insertIndex === -1) {
        insertIndex = filteredLines.length;
      }
    } else {
      insertIndex = filteredLines.length;
    }
    
    // Add Admin section header
    filteredLines.splice(insertIndex, 0, '', '# Admin Authentication', '# Gallery management admin routes');
    insertIndex += 3;
  }
  
  // Insert credentials at the appropriate location
  const newLines = [
    ...filteredLines.slice(0, insertIndex),
    `ADMIN_USERNAME=${username}`,
    `ADMIN_PASSWORD=${password}`,
    ...filteredLines.slice(insertIndex)
  ];
  
  writeEnvFile(newLines.join('\n'));
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

