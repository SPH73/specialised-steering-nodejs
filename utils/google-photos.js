const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

let oAuth2Client = null;
let credentials = null;

/**
 * Load Google API credentials from credentials.json
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
 */
const initializeOAuth2Client = () => {
  if (oAuth2Client) return oAuth2Client;

  const creds = loadCredentials();
  // Support both "web" (web app) and "installed" (desktop app) credential types
  const credentials = creds.web || creds.installed;
  const { client_secret, client_id, redirect_uris } = credentials;

  oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0],
  );

  return oAuth2Client;
};

/**
 * Load and set OAuth2 credentials from token.json
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
        "Token file not found. Please run the OAuth flow to generate token.json",
      );
    }
    throw error;
  }
};

/**
 * Save OAuth2 token to token.json
 */
const saveToken = async token => {
  const tokenPath = path.join(__dirname, "..", "token.json");
  await writeFileAsync(tokenPath, JSON.stringify(token), "utf8");
};

/**
 * Get authenticated Google Photos API client
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
          // If refresh fails, try with existing token (might still work)
          console.warn(
            "Token refresh failed, using existing token:",
            refreshError.message,
          );
        }
      }
    }

    return client;
  } catch (error) {
    console.error("Error authenticating Google Photos API:", error);
    throw error;
  }
};

/**
 * Fetch photos from a specific Google Photos album
 * @param {string} albumId - The Google Photos album ID
 * @returns {Promise<Array>} Array of photo objects with URLs, dimensions, and metadata
 */
const getAlbumPhotos = async albumId => {
  try {
    const auth = await getAuthenticatedClient();
    const photos = google.photoslibrary({ version: "v1", auth });

    const allPhotos = [];
    let pageToken = null;

    do {
      const requestBody = {
        albumId: albumId,
        pageSize: 100,
      };

      if (pageToken) {
        requestBody.pageToken = pageToken;
      }

      // Use mediaItems.search to get photos from album
      const response = await photos.mediaItems.search({
        requestBody: requestBody,
      });

      if (response.data.mediaItems) {
        const formattedPhotos = response.data.mediaItems.map(item => {
          // Get the best available image URL (prefer high quality, fallback to baseUrl)
          const baseUrl = item.baseUrl;
          const width = item.mediaMetadata?.width || 0;
          const height = item.mediaMetadata?.height || 0;

          // Request optimized image (w=2048 for good quality without being too large)
          const imageUrl = baseUrl ? `${baseUrl}=w2048-h2048` : null;
          // Thumbnail for lazy loading
          const thumbnailUrl = baseUrl ? `${baseUrl}=w400-h400` : null;

          return {
            id: item.id,
            filename: item.filename,
            mimeType: item.mimeType,
            url: imageUrl || baseUrl,
            thumbnailUrl: thumbnailUrl || baseUrl,
            width: width,
            height: height,
            description: item.description || "",
            creationTime: item.mediaMetadata?.creationTime || "",
          };
        });

        allPhotos.push(...formattedPhotos);
      }

      pageToken = response.data.nextPageToken || null;
    } while (pageToken);

    return allPhotos;
  } catch (error) {
    console.error("Error fetching album photos:", error);
    throw error;
  }
};

/**
 * Get list of all albums
 * @returns {Promise<Array>} Array of album objects
 */
const getAlbums = async () => {
  try {
    const auth = await getAuthenticatedClient();
    const photos = google.photoslibrary({ version: "v1", auth });

    const response = await photos.albums.list({
      pageSize: 50,
    });

    return response.data.albums || [];
  } catch (error) {
    console.error("Error fetching albums:", error);
    throw error;
  }
};

module.exports = {
  getAlbumPhotos,
  getAlbums,
  getAuthenticatedClient,
};
