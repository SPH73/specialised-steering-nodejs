/**
 * List Google Photos Albums
 *
 * Run this script AFTER authentication to see all available albums
 * and find the album ID you want to use for the gallery.
 *
 * Usage: node list-google-photos-albums.js
 */

require("dotenv").config();

let getAlbums = null;
try {
  const googlePhotos = require("./utils/google-photos");
  getAlbums = googlePhotos.getAlbums;
} catch (error) {
  console.error("❌ Error loading Google Photos utility:", error.message);
  console.error(
    "   Make sure 'googleapis' is installed: npm install googleapis",
  );
  process.exit(1);
}

async function main() {
  console.log("📸 Fetching Google Photos Albums...");
  console.log("=".repeat(60));

  try {
    const albums = await getAlbums();

    if (!albums || albums.length === 0) {
      console.log("\n⚠️  No albums found in this Google Photos account.");
      console.log(
        "   Make sure you've authenticated with the correct account.",
      );
      return;
    }

    console.log(`\n✅ Found ${albums.length} album(s):\n`);

    // Sort by photo count (descending) to show most relevant albums first
    albums.sort((a, b) => (b.mediaItemsCount || 0) - (a.mediaItemsCount || 0));

    albums.forEach((album, index) => {
      console.log(`${"=".repeat(60)}`);
      console.log(`${index + 1}. 📁 ${album.title || "(Untitled Album)"}`);
      console.log(`   📊 Photos: ${album.mediaItemsCount || 0}`);
      console.log(`   🆔 Album ID: ${album.id}`);
      if (album.coverPhotoBaseUrl) {
        console.log(`   🖼️  Cover photo available`);
      }
      console.log("");
    });

    console.log("=".repeat(60));
    console.log("\n💡 Tips for identifying the right album:");
    console.log("   • Ask the client: 'How many photos are in the album?'");
    console.log("   • Match the photo count to the number above");
    console.log("   • If it's a shared album, it should appear in this list");
    console.log("   • Albums are sorted by photo count (largest first)\n");
    console.log("📝 To use an album for the gallery:");
    console.log(`   Add this to your .env file:`);
    console.log(`   GOOGLE_PHOTOS_ALBUM_ID=<album-id-from-above>\n`);
  } catch (error) {
    console.error("\n❌ Error fetching albums:", error.message);
    if (error.message.includes("token")) {
      console.error(
        "\n💡 Make sure you've run the authentication script first:",
      );
      console.error("   node setup-google-photos-auth.js\n");
    }
    process.exit(1);
  }
}

main().catch(console.error);
