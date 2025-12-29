#!/usr/bin/env node

/**
 * Script to list all Google Photos albums and their IDs
 * This is a workaround since Google discontinued the sharedAlbums endpoints
 *
 * Usage:
 *   node list-albums.js
 */

require("dotenv").config();
const { getAlbums } = require("./utils/google-photos");

async function main() {
  try {
    console.log("📸 Fetching your Google Photos albums...\n");

    const albums = await getAlbums();

    if (albums.length === 0) {
      console.log("❌ No albums found.");
      console.log("\n💡 Make sure:");
      console.log("   - You have albums in your Google Photos account");
      console.log("   - You're authenticated with the correct account");
      console.log("   - Your token has the required scopes");
      process.exit(1);
    }

    console.log(`✅ Found ${albums.length} album(s):\n`);
    console.log("=".repeat(80));

    albums.forEach((album, index) => {
      console.log(`\n${index + 1}. ${album.title || "(Untitled)"}`);
      console.log(`   ID: ${album.id}`);
      if (album.isShared) {
        console.log(`   📤 Shared album`);
      }
      if (album.coverPhotoBaseUrl) {
        console.log(`   🖼️  Has cover photo`);
      }
      console.log(`   📅 ${album.mediaItemsCount || 0} photos`);
    });

    console.log("\n" + "=".repeat(80));
    console.log("\n📝 To use an album, copy its ID and add to your .env file:");
    console.log("   GOOGLE_PHOTOS_ALBUM_ID=<album-id-here>\n");
  } catch (error) {
    console.error("\n❌ Error fetching albums:");
    console.error(`   ${error.message}`);

    if (
      error.message &&
      error.message.includes("insufficient authentication scopes")
    ) {
      console.error("\n💡 Tip: You may need to re-authenticate:");
      console.error("   Run: node setup-google-photos-auth.js");
      console.error("   Make sure to grant all requested permissions.\n");
    }

    process.exit(1);
  }
}

main().catch(console.error);
