/**
 * Google Photos OAuth Setup Script
 * 
 * Run this script ONCE to authenticate and get a refresh token.
 * After running this, the gallery will work for all visitors.
 * 
 * Usage: node setup-google-photos-auth.js
 */

require("dotenv").config();
const { google } = require("googleapis");
const readline = require("readline");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const SCOPES = ["https://www.googleapis.com/auth/photoslibrary.readonly"];

/**
 * Load credentials from credentials.json
 */
function loadCredentials() {
  try {
    const credentialsPath = path.join(__dirname, "credentials.json");
    const content = fs.readFileSync(credentialsPath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.error("❌ Error loading credentials.json:", error.message);
    console.error("Please ensure credentials.json exists in the project root.");
    process.exit(1);
  }
}

/**
 * Get new token after prompting for user authorization
 */
async function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log("\n🔐 Authorization required!");
  console.log("=".repeat(60));
  console.log("1. Open this URL in your browser:");
  console.log("\n   " + authUrl);
  console.log("\n2. You will be asked to sign in with your Google account");
  console.log("   (Use the account that owns the photos you want to display)");
  console.log("\n3. Grant permission to access Google Photos");
  console.log("\n4. Copy the authorization code from the browser");
  console.log("=".repeat(60));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    rl.question("\n📋 Paste the authorization code here: ", async (code) => {
      rl.close();

      try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);

        // Save token to token.json
        const tokenPath = path.join(__dirname, "token.json");
        await writeFileAsync(tokenPath, JSON.stringify(tokens, null, 2));
        console.log("\n✅ Token stored to token.json");

        return resolve(tokens);
      } catch (error) {
        console.error("❌ Error retrieving access token:", error);
        return reject(error);
      }
    });
  });
}

/**
 * Main setup function
 */
async function main() {
  console.log("🚀 Google Photos OAuth Setup");
  console.log("=".repeat(60));
  console.log("This script will help you authenticate to access Google Photos.");
  console.log("You only need to run this ONCE.\n");

  // Load credentials
  const credentials = loadCredentials();
  const { client_secret, client_id, redirect_uris } = credentials.web;

  // Create OAuth2 client
  // Use out-of-band URI for command-line flow (shows code on page instead of redirecting)
  const redirectUri = "urn:ietf:wg:oauth:2.0:oob";
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirectUri
  );

  // Check if we already have a token
  const tokenPath = path.join(__dirname, "token.json");
  try {
    const token = await readFileAsync(tokenPath, "utf8");
    const parsedToken = JSON.parse(token);

    if (parsedToken.refresh_token) {
      console.log("✅ token.json already exists with a refresh token.");
      console.log("   If you need to re-authenticate, delete token.json and run this script again.\n");
      
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question("Do you want to re-authenticate? (y/N): ", (answer) => {
        rl.close();
        if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
          getNewToken(oAuth2Client)
            .then(() => {
              console.log("\n✅ Setup complete! The gallery should now work.");
              process.exit(0);
            })
            .catch((error) => {
              console.error("\n❌ Setup failed:", error.message);
              process.exit(1);
            });
        } else {
          console.log("\n✅ Keeping existing token. Setup complete!");
          process.exit(0);
        }
      });
      return;
    }
  } catch (error) {
    // Token file doesn't exist or is invalid, proceed with authentication
  }

  // Get new token
  try {
    await getNewToken(oAuth2Client);
    console.log("\n✅ Setup complete! The gallery should now work.");
    console.log("\n📝 Next steps:");
    console.log("   1. Set GOOGLE_PHOTOS_ALBUM_ID in your .env file");
    console.log("   2. Restart your server");
    console.log("   3. Visit /gallery to see your photos\n");
  } catch (error) {
    console.error("\n❌ Setup failed:", error.message);
    process.exit(1);
  }
}

// Run the setup
main().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});

