require('dotenv').config();
const { initGalleryTable } = require('../utils/gallery-db');

async function main() {
  try {
    console.log('Initializing gallery database...');
    await initGalleryTable();
    console.log('✅ Gallery database initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing gallery database:', error.message);
    process.exit(1);
  }
}

main();

