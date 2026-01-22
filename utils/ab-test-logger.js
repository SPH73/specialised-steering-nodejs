const fs = require("fs/promises");
const path = require("path");

const logsDir = path.join(__dirname, "..", "logs");
const viewsLog = path.join(logsDir, "ab-views.log");
const conversionsLog = path.join(logsDir, "ab-conversions.log");

const ensureLogsDir = async () => {
  await fs.mkdir(logsDir, { recursive: true });
};

const appendJsonLine = async (filePath, payload) => {
  try {
    await ensureLogsDir();
    await fs.appendFile(filePath, `${JSON.stringify(payload)}\n`, "utf8");
  } catch (error) {
    console.error("A/B log write failed:", error.message);
  }
};

const logAbView = async payload => {
  await appendJsonLine(viewsLog, payload);
};

const logAbConversion = async payload => {
  await appendJsonLine(conversionsLog, payload);
};

const readAbLog = async filePath => {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (error) {
          return null;
        }
      })
      .filter(Boolean);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
};

const getAbReport = async ({ days = 30 } = {}) => {
  const cutoffMs = Date.now() - days * 24 * 60 * 60 * 1000;
  const [views, conversions] = await Promise.all([
    readAbLog(viewsLog),
    readAbLog(conversionsLog),
  ]);

  const filteredViews = views.filter(item => item.ts >= cutoffMs);
  const filteredConversions = conversions.filter(item => item.ts >= cutoffMs);

  const countBy = (items, key) =>
    items.reduce((acc, item) => {
      const value = item[key] || "unknown";
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});

  const countByVariantAndPath = items =>
    items.reduce((acc, item) => {
      const variant = item.variant || "unknown";
      const pathKey = item.path || "unknown";
      if (!acc[variant]) {
        acc[variant] = {};
      }
      acc[variant][pathKey] = (acc[variant][pathKey] || 0) + 1;
      return acc;
    }, {});

  return {
    windowDays: days,
    views: {
      total: filteredViews.length,
      byVariant: countBy(filteredViews, "variant"),
      byVariantPath: countByVariantAndPath(filteredViews),
    },
    conversions: {
      total: filteredConversions.length,
      byVariant: countBy(filteredConversions, "variant"),
      byForm: countBy(filteredConversions, "form"),
      byVariantPath: countByVariantAndPath(filteredConversions),
    },
  };
};

module.exports = {
  logAbView,
  logAbConversion,
  getAbReport,
};
