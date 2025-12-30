require('dotenv').config();
const express = require('express');
const router = express.Router();

const { createPickerSession, getSessionStatus, getAllMediaItems } = require('../utils/google-picker');
const { uploadFromUrl, generateCloudinaryUrl } = require('../utils/cloudinary-upload');
const {
  initGalleryTable,
  insertGalleryItem,
  getGalleryItemBySourceId,
  deleteAllGalleryItems,
} = require('../utils/gallery-db');

/**
 * POST /admin/google/photos/sessions
 * Create a picker session
 * Returns: { sessionId: string }
 */
router.post('/google/photos/sessions', async (req, res) => {
  try {
    const session = await createPickerSession();
    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating picker session:', error);
    res.status(500).json({ error: 'Failed to create picker session', message: error.message });
  }
});

/**
 * GET /admin/google/photos/sessions/:sessionId/status
 * Get session status
 * Returns: { status: string, ... }
 */
router.get('/google/photos/sessions/:sessionId/status', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const status = await getSessionStatus(sessionId);
    res.json(status);
  } catch (error) {
    console.error('Error getting session status:', error);
    res.status(500).json({ error: 'Failed to get session status', message: error.message });
  }
});

/**
 * POST /admin/google/photos/sessions/:sessionId/ingest
 * Ingest media items from session
 * Downloads from Google Photos, uploads to Cloudinary, stores in DB
 * Returns: { success: boolean, ingested: number, skipped: number, errors: Array }
 */
router.post('/google/photos/sessions/:sessionId/ingest', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const replaceMode = process.env.GALLERY_REPLACE_MODE === 'true';

    // Ensure database table exists
    await initGalleryTable();

    // If replace mode, delete all existing items
    if (replaceMode) {
      const deletedCount = await deleteAllGalleryItems();
      console.log(`Replace mode: Deleted ${deletedCount} existing gallery items`);
    }

    // Get media items from session
    const mediaItems = await getAllMediaItems(sessionId);

    if (!mediaItems || mediaItems.length === 0) {
      return res.json({ success: true, ingested: 0, skipped: 0, errors: [] });
    }

    const results = {
      ingested: 0,
      skipped: 0,
      errors: [],
    };

    // Process each media item
    for (const item of mediaItems) {
      try {
        const sourceMediaItemId = item.id;
        const baseUrl = item.baseUrl; // Google Photos base URL

        // Check if item already exists (idempotency)
        const existing = await getGalleryItemBySourceId(sourceMediaItemId);
        if (existing) {
          console.log(`Skipping duplicate item: ${sourceMediaItemId}`);
          results.skipped++;
          continue;
        }

        // Upload to Cloudinary
        const uploadResult = await uploadFromUrl(baseUrl, {
          folder: process.env.CLOUDINARY_FOLDER || 'gallery/google-photos',
          public_id: `gallery-${sourceMediaItemId.replace(/[^a-zA-Z0-9]/g, '-')}`,
        });

        // Generate thumbnail URL if needed
        const thumbnailUrl = uploadResult.secure_url ? generateCloudinaryUrl(uploadResult.public_id, [{ width: 300, height: 300, crop: 'thumb' }]) : null;

        // Store in database
        await insertGalleryItem({
          source_media_item_id: sourceMediaItemId,
          cloudinary_url: uploadResult.secure_url,
          thumbnail_url: thumbnailUrl,
          filename: uploadResult.original_filename || item.filename || null,
          width: uploadResult.width || null,
          height: uploadResult.height || null,
          mime_type: uploadResult.format ? `image/${uploadResult.format}` : item.mimeType || null,
        });

        results.ingested++;
        console.log(`Ingested item: ${sourceMediaItemId}`);
      } catch (itemError) {
        console.error(`Error processing item ${item.id}:`, itemError);
        results.errors.push({
          itemId: item.id,
          error: itemError.message,
        });
      }
    }

    res.json({
      success: results.errors.length === 0,
      ingested: results.ingested,
      skipped: results.skipped,
      errors: results.errors,
    });
  } catch (error) {
    console.error('Error ingesting media items:', error);
    res.status(500).json({ error: 'Failed to ingest media items', message: error.message });
  }
});

module.exports = router;

