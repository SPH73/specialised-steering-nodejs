/**
 * A/B Test Logging Utility
 * Hybrid logging: server-side file logs + GA4 event tracking
 */

const fs = require("fs").promises;
const path = require("path");
const requestIp = require("request-ip");

const LOG_FILE = path.join(__dirname, "../logs/ab-tests.log");

/**
 * Log an A/B test exposure event (user sees a variant)
 *
 * @param {Object} req - Express request object
 * @param {string} testId - Test identifier
 * @param {string} variant - Variant identifier (A, B, etc.)
 * @param {string} route - Route path
 */
async function logExposure(req, testId, variant, route) {
  const timestamp = new Date().toISOString();
  const clientIp = requestIp.getClientIp(req);
  const sessionId = req.cookies["ab_session"] || generateSessionId();
  const userAgent = req.get("user-agent") || "unknown";
  const referrer = req.get("referer") || req.get("referrer") || "direct";

  const logEntry = {
    timestamp,
    eventType: "exposure",
    testId,
    variant,
    route,
    sessionId,
    ip: clientIp,
    userAgent,
    referrer,
  };

  // Write to log file (non-blocking)
  await writeToLogFile(logEntry);

  return logEntry;
}

/**
 * Log an A/B test conversion event (user completes goal action)
 *
 * @param {Object} req - Express request object
 * @param {string} testId - Test identifier
 * @param {string} variant - Variant identifier
 * @param {string} conversionType - Type of conversion (form_submit, call, etc.)
 * @param {Object} metadata - Additional metadata
 */
async function logConversion(req, testId, variant, conversionType, metadata = {}) {
  const timestamp = new Date().toISOString();
  const clientIp = requestIp.getClientIp(req);
  const sessionId = req.cookies["ab_session"] || "unknown";

  const logEntry = {
    timestamp,
    eventType: "conversion",
    testId,
    variant,
    conversionType,
    sessionId,
    ip: clientIp,
    metadata,
  };

  // Write to log file (non-blocking)
  await writeToLogFile(logEntry);

  return logEntry;
}

/**
 * Write log entry to file
 *
 * @param {Object} logEntry - Log entry object
 */
async function writeToLogFile(logEntry) {
  try {
    // Format: timestamp | eventType | testId | variant | route | sessionId | metadata
    const line =
      `${logEntry.timestamp} | ` +
      `${logEntry.eventType} | ` +
      `${logEntry.testId} | ` +
      `${logEntry.variant} | ` +
      `${logEntry.route || logEntry.conversionType} | ` +
      `${logEntry.sessionId} | ` +
      `${JSON.stringify({
        ip: logEntry.ip,
        referrer: logEntry.referrer,
        metadata: logEntry.metadata,
      })}\n`;

    await fs.appendFile(LOG_FILE, line, "utf8");
  } catch (error) {
    console.error("Failed to write A/B test log:", error.message);
    // Don't throw - logging failures shouldn't break the app
  }
}

/**
 * Generate a simple session ID
 * Note: In production, consider using express-session or similar
 *
 * @returns {string} - Session ID
 */
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get A/B test stats from log file (basic parsing)
 * For production, consider a proper analytics database
 *
 * @param {string} testId - Test identifier (optional - all tests if not provided)
 * @param {number} days - Number of days to look back (default: 7)
 * @returns {Object} - Stats object with exposures, conversions, CTR by variant
 */
async function getStats(testId = null, days = 7) {
  try {
    const content = await fs.readFile(LOG_FILE, "utf8");
    const lines = content.split("\n").filter((line) => line.trim());

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const stats = {};

    lines.forEach((line) => {
      const parts = line.split(" | ");
      if (parts.length < 6) return;

      const timestamp = new Date(parts[0]);
      if (timestamp < cutoffDate) return;

      const eventType = parts[1];
      const logTestId = parts[2];
      const variant = parts[3];

      // Filter by testId if provided
      if (testId && logTestId !== testId) return;

      // Initialize stats for this test/variant
      if (!stats[logTestId]) {
        stats[logTestId] = {};
      }
      if (!stats[logTestId][variant]) {
        stats[logTestId][variant] = { exposures: 0, conversions: 0, ctr: 0 };
      }

      if (eventType === "exposure") {
        stats[logTestId][variant].exposures++;
      } else if (eventType === "conversion") {
        stats[logTestId][variant].conversions++;
      }
    });

    // Calculate CTR for each variant
    Object.keys(stats).forEach((testId) => {
      Object.keys(stats[testId]).forEach((variant) => {
        const { exposures, conversions } = stats[testId][variant];
        stats[testId][variant].ctr =
          exposures > 0 ? ((conversions / exposures) * 100).toFixed(2) : 0;
      });
    });

    return stats;
  } catch (error) {
    if (error.code === "ENOENT") {
      // Log file doesn't exist yet
      return {};
    }
    console.error("Error reading A/B test stats:", error.message);
    return {};
  }
}

/**
 * Get recent log entries
 *
 * @param {number} limit - Maximum number of entries to return (default: 100)
 * @returns {Array} - Array of log entries
 */
async function getRecentLogs(limit = 100) {
  try {
    const content = await fs.readFile(LOG_FILE, "utf8");
    const lines = content.split("\n").filter((line) => line.trim());

    return lines
      .slice(-limit)
      .reverse()
      .map((line) => {
        const parts = line.split(" | ");
        if (parts.length < 6) return null;

        return {
          timestamp: parts[0],
          eventType: parts[1],
          testId: parts[2],
          variant: parts[3],
          routeOrConversion: parts[4],
          sessionId: parts[5],
          metadata: parts[6] ? JSON.parse(parts[6]) : {},
        };
      })
      .filter((entry) => entry !== null);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    console.error("Error reading recent A/B test logs:", error.message);
    return [];
  }
}

module.exports = {
  logExposure,
  logConversion,
  getStats,
  getRecentLogs,
};
