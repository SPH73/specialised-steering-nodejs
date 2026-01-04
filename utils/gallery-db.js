const { readGalleryData, writeGalleryData, getNextId } = require('./database');

/**
 * Initialize gallery storage (JSON file)
 * Creates data directory and initializes empty array if file doesn't exist
 * @returns {Promise<void>}
 */
const initGalleryTable = async () => {
  return new Promise((resolve, reject) => {
    try {
      const data = readGalleryData();
      // File will be created on first write, just ensure data dir exists
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
      const items = readGalleryData();

      // Check for duplicate source_media_item_id
      const existing = items.find(i => i.source_media_item_id === item.source_media_item_id);
      if (existing) {
        reject(new Error(`Gallery item with source_media_item_id ${item.source_media_item_id} already exists`));
        return;
      }

      // Generate ID
      const id = getNextId(items);
      const newItem = {
        id,
        source_media_item_id: item.source_media_item_id,
        cloudinary_url: item.cloudinary_url,
        thumbnail_url: item.thumbnail_url || null,
        filename: item.filename || null,
        width: item.width || null,
        height: item.height || null,
        mime_type: item.mime_type || null,
        uploaded_at: new Date().toISOString(),
      };

      items.push(newItem);
      writeGalleryData(items);

      resolve(newItem);
    } catch (error) {
      reject(error);
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
      const items = readGalleryData();

      // Sort by uploaded_at DESC
      const sorted = items.sort((a, b) => {
        const dateA = new Date(a.uploaded_at || 0);
        const dateB = new Date(b.uploaded_at || 0);
        return dateB - dateA;
      });

      resolve(sorted);
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
      const items = readGalleryData();
      const item = items.find(i => i.source_media_item_id === sourceId);
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
      const items = readGalleryData();
      const count = items.length;
      writeGalleryData([]);
      resolve(count);
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
      const items = readGalleryData();
      const initialLength = items.length;
      const filtered = items.filter(i => i.id !== id);

      if (filtered.length < initialLength) {
        writeGalleryData(filtered);
        resolve(true);
      } else {
        resolve(false);
      }
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
      const items = readGalleryData();
      resolve(items.length);
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
