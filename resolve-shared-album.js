#!/usr/bin/env node

/**
 * Script to join and resolve a Google Photos shared album
 * This will get the album ID from a share token
 *
 * Usage:
 *   node resolve-shared-album.js <share-token>
 *   or
 *   GOOGLE_PHOTOS_SHARE_TOKEN=<token> node resolve-shared-album.js
 */

require("dotenv").config();
const { resolveSharedAlbum } = require("./utils/google-photos");

async function main() {
  // Get share token from command line argument or environment variable
  const shareToken = process.argv[2] || process.env.GOOGLE_PHOTOS_SHARE_TOKEN;

  if (!shareToken) {
    console.error("❌ Error: Share token required");
    console.error("\nUsage:");
    console.error("  node resolve-shared-album.js <share-token>");
    console.error("  or");
    console.error(
      "  GOOGLE_PHOTOS_SHARE_TOKEN=<token> node resolve-shared-album.js",
    );
    console.error(
      "\nTo get the share token, extract it from the Google Photos share URL:",
    );
    console.error(
      "  Example: https://photos.app.goo.gl/ABCD1234 -> share token is 'ABCD1234'",
    );
    console.error(
      "  Or from the full URL: https://photos.app.goo.gl/?pli=1&eid=AF1QipM08_-tTuq-xdl6P5dXTwphhSI6-bUXGVI8ltV_3qwxhLYhwV-HaXEBKVaktjrIzA",
    );
    console.error(
      "  The share token is the part after 'eid=' in the URL parameters",
    );
    process.exit(1);
  }

  try {
    console.log("🔍 Resolving shared album...");
    console.log(`   Share token: ${shareToken.substring(0, 20)}...`);

    const albumId = await resolveSharedAlbum(shareToken);

    console.log("\n✅ Success! Album resolved:");
    console.log(`   Album ID: ${albumId}`);
    console.log("\n📝 Add this to your .env file:");
    console.log(`   GOOGLE_PHOTOS_ALBUM_ID=${albumId}`);
    console.log(
      "\n💡 Note: The album has been joined. You can now use this album ID to fetch photos.",
    );
  } catch (error) {
    console.error("\n❌ Error resolving shared album:");
    console.error(`   ${error.message}`);

    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(
        `   Response: ${JSON.stringify(error.response.data, null, 2)}`,
      );
    }

    if (
      error.message &&
      error.message.includes("insufficient authentication scopes")
    ) {
      console.error(
        "\n💡 Tip: Make sure you have re-authenticated after adding the scopes.",
      );
      console.error(
        "   Run: node setup-google-photos-auth.js (and use prompt=consent)",
      );
    }

    process.exit(1);
  }
}

main();
