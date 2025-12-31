const { getDatabase } = require("./database");
const crypto = require("crypto");

/**
 * Initialize password_reset_tokens table
 * Creates table if it doesn't exist (idempotent)
 * @returns {Promise<void>}
 */
const initPasswordResetTable = async () => {
  return new Promise((resolve, reject) => {
    try {
      const db = getDatabase();

      // Create table
      db.exec(`
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          token TEXT UNIQUE NOT NULL,
          email TEXT NOT NULL,
          expires_at DATETIME NOT NULL,
          used INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_token
          ON password_reset_tokens(token);

        CREATE INDEX IF NOT EXISTS idx_email
          ON password_reset_tokens(email);

        CREATE INDEX IF NOT EXISTS idx_expires_at
          ON password_reset_tokens(expires_at);
      `);

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
      // Ensure table exists
      initPasswordResetTable()
        .then(() => {
          const db = getDatabase();
          const token = generateResetToken();
          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + expirationHours);

          const stmt = db.prepare(`
          INSERT INTO password_reset_tokens (token, email, expires_at)
          VALUES (?, ?, ?)
        `);

          stmt.run(token, email, expiresAt.toISOString());

          resolve(token);
        })
        .catch(reject);
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
const getResetToken = async token => {
  return new Promise((resolve, reject) => {
    try {
      const db = getDatabase();
      const stmt = db.prepare(`
        SELECT * FROM password_reset_tokens
        WHERE token = ? AND used = 0 AND expires_at > datetime('now')
        LIMIT 1
      `);

      const result = stmt.get(token);
      resolve(result || null);
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
const markTokenAsUsed = async token => {
  return new Promise((resolve, reject) => {
    try {
      const db = getDatabase();
      const stmt = db.prepare(`
        UPDATE password_reset_tokens
        SET used = 1
        WHERE token = ?
      `);

      stmt.run(token);
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
      const db = getDatabase();
      const stmt = db.prepare(`
        DELETE FROM password_reset_tokens
        WHERE expires_at < datetime('now') OR used = 1
      `);

      const result = stmt.run();
      resolve(result.changes);
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
