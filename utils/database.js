const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let db = null;

/**
 * Get database instance (singleton pattern)
 * Creates database file if it doesn't exist
 * @returns {Database} SQLite database instance
 */
const getDatabase = () => {
  if (db) {
    return db;
  }

  const dbPath = path.join(__dirname, '..', 'data', 'gallery.db');
  
  // Ensure data directory exists
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = new Database(dbPath);
  
  // Enable foreign keys (if needed in future)
  db.pragma('foreign_keys = ON');

  return db;
};

module.exports = { getDatabase };

