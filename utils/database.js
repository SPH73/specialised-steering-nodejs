const fs = require('fs');
const path = require('path');

/**
 * JSON file-based storage for gallery items
 * Replaces SQLite to avoid native dependencies (better-sqlite3)
 */

const DATA_DIR = path.join(__dirname, '..', 'data');
const GALLERY_FILE = path.join(DATA_DIR, 'gallery.json');

/**
 * Ensure data directory exists
 */
const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

/**
 * Read gallery data from JSON file
 * @returns {Array} Array of gallery items
 */
const readGalleryData = () => {
  ensureDataDir();

  if (!fs.existsSync(GALLERY_FILE)) {
    return [];
  }

  try {
    const data = fs.readFileSync(GALLERY_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading gallery data:', error);
    return [];
  }
};

/**
 * Write gallery data to JSON file (atomic write)
 * @param {Array} data - Array of gallery items
 */
const writeGalleryData = (data) => {
  ensureDataDir();

  // Write to temp file first, then rename (atomic operation)
  const tempFile = GALLERY_FILE + '.tmp';
  try {
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, GALLERY_FILE);
  } catch (error) {
    // Clean up temp file on error
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
    throw error;
  }
};

/**
 * Get next auto-incrementing ID
 * @param {Array} items - Array of gallery items
 * @returns {number} Next ID
 */
const getNextId = (items) => {
  if (items.length === 0) {
    return 1;
  }
  const maxId = Math.max(...items.map(item => item.id || 0));
  return maxId + 1;
};

module.exports = {
  readGalleryData,
  writeGalleryData,
  getNextId,
  GALLERY_FILE, // Export for testing/debugging
};
