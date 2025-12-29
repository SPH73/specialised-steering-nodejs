/**
 * Airtable API Call Monitor
 *
 * This utility helps track Airtable API call usage by logging each call
 * with context about where it was made and when.
 *
 * Usage:
 *   const { trackAirtableCall } = require('./utils/airtable-monitor');
 *   trackAirtableCall('homepage', 'select');
 */

const fs = require("fs");
const path = require("path");

// Store call counts in memory (resets on server restart)
let callCounts = {
  total: 0,
  byEndpoint: {},
  byOperation: {},
  byDate: {},
  recentCalls: [], // Keep last 100 calls for debugging
};

// Log file path
const logFilePath = path.join(__dirname, "../logs/airtable-calls.log");
const logDir = path.dirname(logFilePath);

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
  try {
    fs.mkdirSync(logDir, { recursive: true });
  } catch (err) {
    console.warn("Could not create logs directory:", err.message);
  }
}

/**
 * Track an Airtable API call
 * @param {string} endpoint - The endpoint/route where the call was made (e.g., 'homepage', 'enquiry-form')
 * @param {string} operation - The Airtable operation (e.g., 'select', 'create', 'update', 'find')
 * @param {Object} metadata - Optional metadata about the call
 */
function trackAirtableCall(endpoint, operation, metadata = {}) {
  const timestamp = new Date().toISOString();
  const date = timestamp.split("T")[0]; // YYYY-MM-DD

  // Update counters
  callCounts.total++;
  callCounts.byEndpoint[endpoint] = (callCounts.byEndpoint[endpoint] || 0) + 1;
  callCounts.byOperation[operation] =
    (callCounts.byOperation[operation] || 0) + 1;
  callCounts.byDate[date] = (callCounts.byDate[date] || 0) + 1;

  // Store recent call
  const callInfo = {
    timestamp,
    endpoint,
    operation,
    metadata,
  };

  callCounts.recentCalls.push(callInfo);

  // Keep only last 100 calls
  if (callCounts.recentCalls.length > 100) {
    callCounts.recentCalls.shift();
  }

  // Log to file (async, non-blocking)
  const logEntry = `${timestamp} | ${endpoint} | ${operation} | ${JSON.stringify(
    metadata,
  )}\n`;

  fs.appendFile(logFilePath, logEntry, err => {
    if (err) {
      console.error("Failed to write Airtable call log:", err.message);
    }
  });

  // Log to console in development
  if (process.env.NODE_ENV !== "production") {
    console.log(
      `[Airtable API] ${operation} from ${endpoint} (Total: ${callCounts.total})`,
    );
  }
}

/**
 * Get current API call statistics
 * @returns {Object} Statistics object
 */
function getStats() {
  return {
    total: callCounts.total,
    byEndpoint: { ...callCounts.byEndpoint },
    byOperation: { ...callCounts.byOperation },
    byDate: { ...callCounts.byDate },
    recentCalls: callCounts.recentCalls.slice(-20), // Last 20 calls
  };
}

/**
 * Reset statistics (useful for testing)
 */
function resetStats() {
  callCounts = {
    total: 0,
    byEndpoint: {},
    byOperation: {},
    byDate: {},
    recentCalls: [],
  };
}

/**
 * Get daily call count for a specific date
 * @param {string} date - Date in YYYY-MM-DD format (defaults to today)
 * @returns {number} Number of calls on that date
 */
function getDailyCount(date = null) {
  if (!date) {
    date = new Date().toISOString().split("T")[0];
  }
  return callCounts.byDate[date] || 0;
}

module.exports = {
  trackAirtableCall,
  getStats,
  resetStats,
  getDailyCount,
};
