require("dotenv").config();
const express = require("express");
const router = express.Router();

const {
  createPickerSession,
  getSessionStatus,
  getAllMediaItems,
} = require("../utils/google-picker");
const {
  uploadFromUrl,
  generateCloudinaryUrl,
} = require("../utils/cloudinary-upload");
const {
  initGalleryTable,
  insertGalleryItem,
  getGalleryItemBySourceId,
  deleteAllGalleryItems,
} = require("../utils/gallery-db");

/**
 * GET /admin/gallery
 * Render admin gallery management UI
 */
router.get("/gallery", (req, res) => {
  res.render("admin-gallery", {
    isAdmin: true,
    meta: {
      title: "Admin - Gallery Management",
      description: "Manage gallery items from Google Photos",
    },
  });
});

/**
 * POST /admin/google/photos/sessions
 * Create a picker session
 * Returns: { sessionId: string }
 */
router.post("/google/photos/sessions", async (req, res) => {
  try {
    const session = await createPickerSession();
    res.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating picker session:", error);
    res.status(500).json({
      error: "Failed to create picker session",
      message: error.message,
    });
  }
});

/**
 * GET /admin/google/photos/sessions/:sessionId/status
 * Get session status
 * Returns: { status: string, ... }
 */
router.get("/google/photos/sessions/:sessionId/status", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const status = await getSessionStatus(sessionId);
    res.json(status);
  } catch (error) {
    console.error("Error getting session status:", error);
    res
      .status(500)
      .json({ error: "Failed to get session status", message: error.message });
  }
});

/**
 * POST /admin/google/photos/sessions/:sessionId/ingest
 * Ingest media items from session
 * Downloads from Google Photos, uploads to Cloudinary, stores in DB
 * Returns: { success: boolean, ingested: number, skipped: number, errors: Array }
 */
router.post("/google/photos/sessions/:sessionId/ingest", async (req, res) => {
  try {
    const { sessionId } = req.params;
    // Get replaceMode from request body, fall back to env var, default to false
    const replaceMode =
      req.body.replaceMode !== undefined
        ? req.body.replaceMode
        : process.env.GALLERY_REPLACE_MODE === "true";

    // Ensure database table exists
    await initGalleryTable();

    // Check session status first - if no media items selected, return early
    const sessionStatus = await getSessionStatus(sessionId);
    if (!sessionStatus.mediaItemsSet) {
      return res.json({
        success: true,
        ingested: 0,
        skipped: 0,
        errors: [],
        message: "No media items selected in this session",
      });
    }

    // If replace mode, delete all existing items
    if (replaceMode) {
      const deletedCount = await deleteAllGalleryItems();
      console.log(
        `Replace mode: Deleted ${deletedCount} existing gallery items`,
      );
    }

    // Get media items from session
    const mediaItems = await getAllMediaItems(sessionId);

    if (!mediaItems || mediaItems.length === 0) {
      return res.json({ success: true, ingested: 0, skipped: 0, errors: [] });
    }

    // Log first media item structure for debugging
    if (mediaItems.length > 0) {
      console.log(
        "Sample media item structure:",
        JSON.stringify(mediaItems[0], null, 2),
      );
    }

    // Get OAuth token once for all downloads (more efficient)
    const { getAuthenticatedClient } = require("../utils/google-oauth");
    const oauthClient = await getAuthenticatedClient();
    const accessToken = oauthClient.credentials.access_token;

    const results = {
      ingested: 0,
      skipped: 0,
      errors: [],
    };

    // Process each media item
    for (const item of mediaItems) {
      try {
        const sourceMediaItemId = item.id;

        // Log every item structure to see what Google returns
        console.log(
          `Processing item ${sourceMediaItemId}:`,
          JSON.stringify(item, null, 2),
        );

        // Google Photos Picker API returns baseUrl nested in mediaFile object
        // Structure: item.mediaFile.baseUrl
        const baseUrl =
          item.mediaFile?.baseUrl || item.baseUrl || item.base_url;

        if (!baseUrl) {
          console.error(
            `Missing baseUrl for item ${sourceMediaItemId}. Full item structure:`,
            JSON.stringify(item, null, 2),
          );
          results.errors.push({
            itemId: sourceMediaItemId,
            error:
              "Missing baseUrl in media item - check server logs for full item structure",
          });
          continue;
        }

        // Validate URL format
        try {
          new URL(baseUrl);
        } catch (urlError) {
          console.error(
            `Invalid URL format for item ${sourceMediaItemId}: ${baseUrl}`,
          );
          console.error(`URL validation error:`, urlError.message);
          results.errors.push({
            itemId: sourceMediaItemId,
            error: `Invalid URL: ${baseUrl}`,
          });
          continue;
        }

        // Check if item already exists (idempotency)
        const existing = await getGalleryItemBySourceId(sourceMediaItemId);
        if (existing) {
          console.log(`Skipping duplicate item: ${sourceMediaItemId}`);
          results.skipped++;
          continue;
        }

        // Double-check baseUrl is valid before uploading
        if (!baseUrl || typeof baseUrl !== "string") {
          console.error(
            `baseUrl validation failed for item ${sourceMediaItemId}:`,
            {
              baseUrl,
              baseUrlType: typeof baseUrl,
              itemKeys: Object.keys(item),
            },
          );
          results.errors.push({
            itemId: sourceMediaItemId,
            error: `Invalid baseUrl: ${baseUrl} (type: ${typeof baseUrl})`,
          });
          continue;
        }

        console.log(`Uploading item ${sourceMediaItemId} from URL: ${baseUrl}`);

        // Upload to Cloudinary (with OAuth token for Google Photos URL)
        const uploadResult = await uploadFromUrl(baseUrl, {
          accessToken: accessToken, // Pass OAuth token for authenticated download
          folder: process.env.CLOUDINARY_FOLDER || "gallery/google-photos",
          public_id: `gallery-${sourceMediaItemId.replace(
            /[^a-zA-Z0-9]/g,
            "-",
          )}`,
        });

        // Generate thumbnail URL if needed
        const thumbnailUrl = uploadResult.secure_url
          ? generateCloudinaryUrl(uploadResult.public_id, [
              { width: 300, height: 300, crop: "thumb" },
            ])
          : null;

        // Store in database
        await insertGalleryItem({
          source_media_item_id: sourceMediaItemId,
          cloudinary_url: uploadResult.secure_url,
          thumbnail_url: thumbnailUrl,
          filename: uploadResult.original_filename || item.filename || null,
          width: uploadResult.width || null,
          height: uploadResult.height || null,
          mime_type: uploadResult.format
            ? `image/${uploadResult.format}`
            : item.mimeType || null,
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
    console.error("Error ingesting media items:", error);
    res
      .status(500)
      .json({ error: "Failed to ingest media items", message: error.message });
  }
});

module.exports = router;
