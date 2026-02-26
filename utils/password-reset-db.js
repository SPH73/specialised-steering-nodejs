// Note: Using separate JSON file storage for password reset tokens
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

/**
 * Password reset tokens storage using JSON file
 * Uses separate file from gallery data
 */

const DATA_DIR = path.join(__dirname, "..", "data");
const PASSWORD_RESET_FILE = path.join(DATA_DIR, "password-reset-tokens.json");

/**
 * Ensure data directory exists
 */
const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

/**
 * Read password reset tokens from JSON file
 * @returns {Array} Array of token objects
 */
const readTokens = () => {
  ensureDataDir();

  if (!fs.existsSync(PASSWORD_RESET_FILE)) {
    return [];
  }

  try {
    const data = fs.readFileSync(PASSWORD_RESET_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading password reset tokens:", error);
    return [];
  }
};

/**
 * Write password reset tokens to JSON file (atomic write)
 * @param {Array} tokens - Array of token objects
 */
const writeTokens = (tokens) => {
  ensureDataDir();

  // Write to temp file first, then rename (atomic operation)
  const tempFile = PASSWORD_RESET_FILE + ".tmp";
  try {
    fs.writeFileSync(tempFile, JSON.stringify(tokens, null, 2), "utf8");
    fs.renameSync(tempFile, PASSWORD_RESET_FILE);
  } catch (error) {
    // Clean up temp file on error
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
    throw error;
  }
};

/**
 * Initialize password_reset_tokens storage (JSON file)
 * Creates data directory if it doesn't exist
 * @returns {Promise<void>}
 */
const initPasswordResetTable = async () => {
  return new Promise((resolve, reject) => {
    try {
      ensureDataDir();
      // File will be created on first write, just ensure data dir exists
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate a secure password reset token
 * @returns {string} Secure random token
 */
const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Create a password reset token
 * @param {string} email - Email address for the reset
 * @param {number} expirationHours - Token expiration in hours (default: 1)
 * @returns {Promise<string>} The generated token
 */
const createResetToken = async (email, expirationHours = 1) => {
  return new Promise((resolve, reject) => {
    try {
      ensureDataDir();
      const tokens = readTokens();
      const token = generateResetToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expirationHours);

      const newToken = {
        id: tokens.length > 0 ? Math.max(...tokens.map((t) => t.id || 0)) + 1 : 1,
        token: token,
        email: email,
        expires_at: expiresAt.toISOString(),
        used: 0,
        created_at: new Date().toISOString(),
      };

      tokens.push(newToken);
      writeTokens(tokens);

      resolve(token);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Validate and get reset token
 * @param {string} token - Reset token to validate
 * @returns {Promise<Object|null>} Token data if valid, null otherwise
 */
const getResetToken = async (token) => {
  return new Promise((resolve, reject) => {
    try {
      const tokens = readTokens();
      const now = new Date().toISOString();

      const validToken = tokens.find(
        (t) =>
          t.token === token &&
          t.used === 0 &&
          new Date(t.expires_at) > new Date(now)
      );

      resolve(validToken || null);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Mark a reset token as used
 * @param {string} token - Token to mark as used
 * @returns {Promise<void>}
 */
const markTokenAsUsed = async (token) => {
  return new Promise((resolve, reject) => {
    try {
      const tokens = readTokens();
      const tokenIndex = tokens.findIndex((t) => t.token === token);

      if (tokenIndex !== -1) {
        tokens[tokenIndex].used = 1;
        writeTokens(tokens);
      }

      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Clean up expired tokens (optional cleanup function)
 * @returns {Promise<number>} Number of tokens deleted
 */
const cleanupExpiredTokens = async () => {
  return new Promise((resolve, reject) => {
    try {
      const tokens = readTokens();
      const now = new Date().toISOString();
      const initialLength = tokens.length;

      const activeTokens = tokens.filter(
        (t) => new Date(t.expires_at) >= new Date(now) && t.used === 0
      );

      writeTokens(activeTokens);
      resolve(initialLength - activeTokens.length);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  initPasswordResetTable,
  generateResetToken,
  createResetToken,
  getResetToken,
  markTokenAsUsed,
  cleanupExpiredTokens,
};
