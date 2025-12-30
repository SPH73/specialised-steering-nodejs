const { getDatabase } = require('./database');

/**
 * Initialize gallery_items table
 * Creates table and indexes if they don't exist (idempotent)
 * @returns {Promise<void>}
 */
const initGalleryTable = async () => {
  return new Promise((resolve, reject) => {
    try {
      const db = getDatabase();
      
      // Create table
      db.exec(`
        CREATE TABLE IF NOT EXISTS gallery_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          source_media_item_id TEXT UNIQUE NOT NULL,
          cloudinary_url TEXT NOT NULL,
          thumbnail_url TEXT,
          filename TEXT,
          width INTEGER,
          height INTEGER,
          mime_type TEXT,
          uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_source_media_item_id 
          ON gallery_items(source_media_item_id);
        
        CREATE INDEX IF NOT EXISTS idx_uploaded_at 
          ON gallery_items(uploaded_at DESC);
      `);
      
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Insert a new gallery item
 * @param {Object} item - Gallery item data
 * @param {string} item.source_media_item_id - Google Photos media item ID
 * @param {string} item.cloudinary_url - Cloudinary URL
 * @param {string} [item.thumbnail_url] - Thumbnail URL
 * @param {string} [item.filename] - Original filename
 * @param {number} [item.width] - Image width
 * @param {number} [item.height] - Image height
 * @param {string} [item.mime_type] - MIME type
 * @returns {Promise<Object>} Inserted item with id
 */
const insertGalleryItem = async (item) => {
  return new Promise((resolve, reject) => {
    try {
      const db = getDatabase();
      const stmt = db.prepare(`
        INSERT INTO gallery_items (
          source_media_item_id,
          cloudinary_url,
          thumbnail_url,
          filename,
          width,
          height,
          mime_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        item.source_media_item_id,
        item.cloudinary_url,
        item.thumbnail_url || null,
        item.filename || null,
        item.width || null,
        item.height || null,
        item.mime_type || null
      );
      
      resolve({
        id: result.lastInsertRowid,
        ...item
      });
    } catch (error) {
      // Handle unique constraint violation (duplicate source_media_item_id)
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        reject(new Error(`Gallery item with source_media_item_id ${item.source_media_item_id} already exists`));
      } else {
        reject(error);
      }
    }
  });
};

/**
 * Get all gallery items ordered by uploaded_at DESC
 * @returns {Promise<Array>} Array of gallery items
 */
const getAllGalleryItems = async () => {
  return new Promise((resolve, reject) => {
    try {
      const db = getDatabase();
      const stmt = db.prepare(`
        SELECT * FROM gallery_items 
        ORDER BY uploaded_at DESC
      `);
      
      const items = stmt.all();
      resolve(items);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Get gallery item by source_media_item_id
 * @param {string} sourceId - Google Photos media item ID
 * @returns {Promise<Object|null>} Gallery item or null if not found
 */
const getGalleryItemBySourceId = async (sourceId) => {
  return new Promise((resolve, reject) => {
    try {
      const db = getDatabase();
      const stmt = db.prepare(`
        SELECT * FROM gallery_items 
        WHERE source_media_item_id = ?
      `);
      
      const item = stmt.get(sourceId);
      resolve(item || null);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Delete all gallery items (for replace mode)
 * @returns {Promise<number>} Number of deleted items
 */
const deleteAllGalleryItems = async () => {
  return new Promise((resolve, reject) => {
    try {
      const db = getDatabase();
      const stmt = db.prepare('DELETE FROM gallery_items');
      const result = stmt.run();
      resolve(result.changes);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Delete a single gallery item by ID
 * @param {number} id - Gallery item ID
 * @returns {Promise<boolean>} True if item was deleted, false if not found
 */
const deleteGalleryItem = async (id) => {
  return new Promise((resolve, reject) => {
    try {
      const db = getDatabase();
      const stmt = db.prepare('DELETE FROM gallery_items WHERE id = ?');
      const result = stmt.run(id);
      resolve(result.changes > 0);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Get total count of gallery items
 * @returns {Promise<number>} Total count
 */
const getGalleryItemCount = async () => {
  return new Promise((resolve, reject) => {
    try {
      const db = getDatabase();
      const stmt = db.prepare('SELECT COUNT(*) as count FROM gallery_items');
      const result = stmt.get();
      resolve(result.count);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  initGalleryTable,
  insertGalleryItem,
  getAllGalleryItems,
  getGalleryItemBySourceId,
  deleteAllGalleryItems,
  deleteGalleryItem,
  getGalleryItemCount,
};

