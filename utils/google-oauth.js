const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

let oAuth2Client = null;
let credentials = null;

// Photo Picker API scope
const SCOPE = "https://www.googleapis.com/auth/photospicker.mediaitems.readonly";

/**
 * Load Google API credentials from credentials.json
 * Used primarily by setup script, but kept for backward compatibility
 */
const loadCredentials = () => {
  if (credentials) return credentials;

  try {
    const credentialsPath = path.join(__dirname, "..", "credentials.json");
    const content = fs.readFileSync(credentialsPath, "utf8");
    credentials = JSON.parse(content);
    return credentials;
  } catch (error) {
    console.error("Error loading Google API credentials:", error);
    throw new Error("Failed to load Google API credentials");
  }
};

/**
 * Initialize OAuth2 client
 * Prefers environment variables, falls back to credentials.json
 */
const initializeOAuth2Client = () => {
  if (oAuth2Client) return oAuth2Client;

  // Prefer environment variables
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (clientId && clientSecret && redirectUri) {
    oAuth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );
    return oAuth2Client;
  }

  // Fall back to credentials.json (for setup script)
  const creds = loadCredentials();
  const credsData = creds.web || creds.installed;
  const { client_secret, client_id, redirect_uris } = credsData;

  oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  return oAuth2Client;
};

/**
 * Load and return OAuth2 token from token.json
 * @returns {Promise<Object>} Token object
 */
const loadToken = async () => {
  const tokenPath = path.join(__dirname, "..", "token.json");

  try {
    const tokenContent = await readFileAsync(tokenPath, "utf8");
    const token = JSON.parse(tokenContent);
    return token;
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(
        "Token file not found. Please run setup-google-picker-auth.js to generate token.json"
      );
    }
    throw error;
  }
};

/**
 * Save OAuth2 token to token.json
 * @param {Object} token - Token object to save
 */
const saveToken = async (token) => {
  const tokenPath = path.join(__dirname, "..", "token.json");
  await writeFileAsync(tokenPath, JSON.stringify(token, null, 2), "utf8");
};

/**
 * Get authenticated OAuth2 client with automatic token refresh
 * @returns {Promise<OAuth2Client>} Authenticated OAuth2 client
 */
const getAuthenticatedClient = async () => {
  const client = initializeOAuth2Client();

  try {
    const token = await loadToken();
    client.setCredentials(token);

    // Refresh token if expired or expiring soon (within 5 minutes)
    const expiryDate = client.credentials.expiry_date;
    if (expiryDate) {
      const now = new Date().getTime();
      const fiveMinutes = 5 * 60 * 1000;
      if (expiryDate <= now + fiveMinutes) {
        try {
          const { credentials: newToken } = await client.refreshAccessToken();
          client.setCredentials(newToken);
          await saveToken(newToken);
        } catch (refreshError) {
          console.warn(
            "Token refresh failed, using existing token:",
            refreshError.message
          );
        }
      }
    }

    return client;
  } catch (error) {
    console.error("Error getting authenticated client:", error);
    throw error;
  }
};

module.exports = {
  loadCredentials,
  initializeOAuth2Client,
  loadToken,
  saveToken,
  getAuthenticatedClient,
  SCOPE,
};

