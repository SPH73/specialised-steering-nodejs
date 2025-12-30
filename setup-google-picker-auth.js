const readline = require("readline");
const { google } = require("googleapis");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const { getAuthenticatedClient, SCOPE } = require("./utils/google-oauth");

const SCOPES = [SCOPE];

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
async function getNewToken(oAuth2Client, redirectUri) {
  // Generate random state for CSRF protection
  const state = crypto.randomBytes(32).toString("hex");

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent", // Force consent screen to ensure refresh token is granted
    state: state, // CSRF protection
  });

  console.log("\n🔐 Authorization required!");
  console.log("=".repeat(60));
  console.log("1. Open this URL in your browser:");
  console.log("\n   " + authUrl);
  console.log("\n2. You will be asked to sign in with your Google account");
  console.log("   (Use the account that owns the photos you want to display)");
  console.log("\n3. Grant permission to access Google Photos via Picker API");
  console.log(
    "\n⚠️  Security: State parameter is included for CSRF protection"
  );
  console.log("   State value: " + state.substring(0, 16) + "...");

  if (redirectUri === "urn:ietf:wg:oauth:2.0:oob") {
    console.log(
      "\n4. After granting permission, you'll see an authorization code on the page"
    );
    console.log("   Copy that code and paste it below");
  } else if (redirectUri.startsWith("http://localhost")) {
    console.log("\n4. After granting permission, you'll be redirected to:");
    console.log("   " + redirectUri);
    console.log("\n5. The page may show an error (this is normal for localhost)");
    console.log("   Look at the URL in your browser's address bar");
    console.log("   Copy the 'code' parameter from the URL");
    console.log("   (It will look like: ?code=4/0A... or &code=4/0A...)");
  } else {
    console.log("\n4. After granting permission, you'll be redirected to:");
    console.log("   " + redirectUri);
    console.log("\n5. Copy the 'code' parameter from the URL in your browser");
    console.log("   (It will look like: ?code=4/0A... or &code=4/0A...)");
  }
  console.log("=".repeat(60));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    rl.question(
      "\n📋 Paste the authorization code or full callback URL here: ",
      async (input) => {
        rl.close();

        // Extract code and state from whatever the user pasted
        let code = input.trim();
        let receivedState = null;

        // If it's a URL, extract both code and state parameters
        if (code.includes("?")) {
          try {
            const url = new URL(code);
            code = url.searchParams.get("code") || code;
            receivedState = url.searchParams.get("state");
          } catch (e) {
            // If URL parsing fails, try manual extraction
          }
        }

        // Extract code parameter if present
        if (code.includes("code=")) {
          const match = code.match(/code=([^&]+)/);
          if (match) {
            code = match[1];
          } else {
            code = code.split("code=")[1]?.split("&")[0] || code;
          }
        }

        // Clean up any remaining URL encoding or whitespace
        code = decodeURIComponent(code).trim();

        // Verify state parameter (CSRF protection)
        if (receivedState && receivedState !== state) {
          console.error("❌ State parameter mismatch. Possible CSRF attack!");
          reject(new Error("State parameter mismatch"));
          return;
        }

        try {
          const { tokens } = await oAuth2Client.getToken(code);
          oAuth2Client.setCredentials(tokens);
          resolve(tokens);
        } catch (error) {
          console.error("❌ Error retrieving access token:", error.message);
          reject(error);
        }
      }
    );
  });
}

async function main() {
  try {
    const credentials = loadCredentials();
    const { client_secret, client_id, redirect_uris } =
      credentials.web || credentials.installed;

    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    // Check if we already have a token
    const tokenPath = path.join(__dirname, "token.json");
    let token;
    try {
      const tokenContent = fs.readFileSync(tokenPath, "utf8");
      token = JSON.parse(tokenContent);
      oAuth2Client.setCredentials(token);

      // Test if token is still valid
      console.log("✅ Existing token found. Testing...");
      const { getAuthenticatedClient } = require("./utils/google-oauth");
      await getAuthenticatedClient();
      console.log("✅ Token is valid and working!");
      process.exit(0);
    } catch (error) {
      // Token file doesn't exist or is invalid, need to get a new one
      console.log("No valid token found. Starting OAuth flow...");
    }

    // Get new token
    token = await getNewToken(oAuth2Client, redirect_uris[0]);

    // Store the token
    fs.writeFileSync(tokenPath, JSON.stringify(token, null, 2));
    console.log("\n✅ Token stored to token.json");
    console.log("✅ OAuth setup complete!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error during OAuth setup:", error.message);
    process.exit(1);
  }
}

main();

