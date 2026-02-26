const { getAuthenticatedClient } = require("./google-oauth");
const { request } = require("gaxios");

const PICKER_API_BASE = "https://photospicker.googleapis.com/v1";

/**
 * Create a picker session
 * @returns {Promise<Object>} Session object with sessionId
 */
const createPickerSession = async () => {
  try {
    const client = await getAuthenticatedClient();
    const accessToken = client.credentials.access_token;

    const response = await request({
      url: `${PICKER_API_BASE}/sessions`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: {
        // Empty body - session creation doesn't require parameters
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error creating picker session:", error);
    if (error.response) {
      throw new Error(
        `Picker API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
      );
    }
    throw error;
  }
};

/**
 * Get session status
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} Session status object
 */
const getSessionStatus = async (sessionId) => {
  try {
    const client = await getAuthenticatedClient();
    const accessToken = client.credentials.access_token;

    const response = await request({
      url: `${PICKER_API_BASE}/sessions/${sessionId}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error getting session status:", error);
    if (error.response) {
      throw new Error(
        `Picker API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
      );
    }
    throw error;
  }
};

/**
 * List media items from a session
 * Handles pagination automatically
 * @param {string} sessionId - Session ID
 * @param {string} [pageToken] - Optional page token for pagination
 * @returns {Promise<Object>} Response object with mediaItems array and nextPageToken
 */
const listMediaItems = async (sessionId, pageToken = null) => {
  try {
    const client = await getAuthenticatedClient();
    const accessToken = client.credentials.access_token;

    const params = new URLSearchParams({
      sessionId: sessionId,
    });

    if (pageToken) {
      params.append("pageToken", pageToken);
    }

    const response = await request({
      url: `${PICKER_API_BASE}/mediaItems?${params.toString()}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error listing media items:", error);
    if (error.response) {
      throw new Error(
        `Picker API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
      );
    }
    throw error;
  }
};

/**
 * Get all media items from a session (handles pagination)
 * @param {string} sessionId - Session ID
 * @returns {Promise<Array>} Array of all media items
 */
const getAllMediaItems = async (sessionId) => {
  const allMediaItems = [];
  let pageToken = null;

  do {
    const response = await listMediaItems(sessionId, pageToken);
    if (response.mediaItems) {
      allMediaItems.push(...response.mediaItems);
    }
    pageToken = response.nextPageToken || null;
  } while (pageToken);

  return allMediaItems;
};

module.exports = {
  createPickerSession,
  getSessionStatus,
  listMediaItems,
  getAllMediaItems,
};

