const fs = require("fs");
const path = require("path");

const ENV_FILE = path.join(__dirname, "..", ".env");
const HTACCESS_FILE = path.join(__dirname, "..", ".htaccess");

/**
 * Check if we're on production/staging (using .htaccess) or development (using .env)
 * @returns {boolean} True if .htaccess exists and contains ADMIN_USERNAME/ADMIN_PASSWORD
 */
function isUsingHtaccess() {
  if (!fs.existsSync(HTACCESS_FILE)) {
    return false;
  }
  const htaccessContent = fs.readFileSync(HTACCESS_FILE, "utf8");
  return (
    htaccessContent.includes("SetEnv ADMIN_USERNAME") ||
    htaccessContent.includes("SetEnv ADMIN_PASSWORD")
  );
}

/**
 * Read .env file content
 * @returns {string} File content
 */
function readEnvFile() {
  if (!fs.existsSync(ENV_FILE)) {
    return "";
  }
  return fs.readFileSync(ENV_FILE, "utf8");
}

/**
 * Read .htaccess file content
 * @returns {string} File content
 */
function readHtaccessFile() {
  if (!fs.existsSync(HTACCESS_FILE)) {
    return "";
  }
  return fs.readFileSync(HTACCESS_FILE, "utf8");
}

/**
 * Write .env file content
 * @param {string} content - File content to write
 */
function writeEnvFile(content) {
  fs.writeFileSync(ENV_FILE, content, "utf8");
}

/**
 * Write .htaccess file content
 * @param {string} content - File content to write
 */
function writeHtaccessFile(content) {
  fs.writeFileSync(HTACCESS_FILE, content, "utf8");
}

/**
 * Update ADMIN_PASSWORD in .env file
 * @param {string} newPassword - New password to set
 * @returns {Promise<void>}
 */
const updateAdminPasswordInEnv = async newPassword => {
  return new Promise((resolve, reject) => {
    try {
      let envContent = readEnvFile();

      // Remove existing ADMIN_PASSWORD line
      const lines = envContent.split("\n");
      const filteredLines = lines.filter(
        line => !line.trim().startsWith("ADMIN_PASSWORD="),
      );

      // Find Admin section or create it
      let adminSectionIndex = -1;
      let insertIndex = -1;

      for (let i = 0; i < filteredLines.length; i++) {
        const line = filteredLines[i].trim();
        // Check for Admin section comment (various formats)
        if (
          line.match(/^#\s*Admin/i) ||
          line.match(/^#\s*Admin\s+Configuration/i) ||
          line.match(/^#\s*Admin\s+Authentication/i)
        ) {
          adminSectionIndex = i;
          // Find ADMIN_USERNAME line and insert after it
          for (let j = i + 1; j < filteredLines.length; j++) {
            if (filteredLines[j].trim().startsWith("ADMIN_USERNAME=")) {
              insertIndex = j + 1;
              break;
            }
            // If we hit another section, insert before it
            if (
              filteredLines[j].trim().startsWith("#") &&
              !filteredLines[j].trim().match(/^#\s*Admin/i)
            ) {
              insertIndex = j;
              break;
            }
          }
          if (insertIndex === -1) {
            // ADMIN_USERNAME not found, insert after Admin section header
            insertIndex = i + 1;
          }
          break;
        }
      }

      // If no Admin section exists, find a good place to add it (after reCAPTCHA or at end)
      if (adminSectionIndex === -1) {
        let recaptchaIndex = -1;
        for (let i = filteredLines.length - 1; i >= 0; i--) {
          if (
            filteredLines[i]
              .trim()
              .match(/^#\s*.*[Rr][Ee][Cc][Aa][Pp][Tt][Cc][Hh][Aa]/)
          ) {
            recaptchaIndex = i;
            break;
          }
        }

        // Find end of reCAPTCHA section
        if (recaptchaIndex !== -1) {
          for (let i = recaptchaIndex + 1; i < filteredLines.length; i++) {
            if (
              filteredLines[i].trim().startsWith("#") &&
              !filteredLines[i]
                .trim()
                .match(/^#\s*.*[Rr][Ee][Cc][Aa][Pp][Tt][Cc][Hh][Aa]/)
            ) {
              insertIndex = i;
              break;
            }
          }
          if (insertIndex === -1) {
            insertIndex = filteredLines.length;
          }
        } else {
          insertIndex = filteredLines.length;
        }

        // Add Admin section header if needed (only if ADMIN_USERNAME also doesn't exist)
        const hasAdminUsername = filteredLines.some(line =>
          line.trim().startsWith("ADMIN_USERNAME="),
        );
        if (!hasAdminUsername) {
          filteredLines.splice(
            insertIndex,
            0,
            "",
            "# Admin Authentication",
            "# Gallery management admin routes",
          );
          insertIndex += 3;
        }
      }

      // Find ADMIN_USERNAME line to insert password after it
      if (insertIndex === -1) {
        for (let i = 0; i < filteredLines.length; i++) {
          if (filteredLines[i].trim().startsWith("ADMIN_USERNAME=")) {
            insertIndex = i + 1;
            break;
          }
        }
      }

      // If still not found, add at the end
      if (insertIndex === -1) {
        insertIndex = filteredLines.length;
      }

      // Insert password
      filteredLines.splice(insertIndex, 0, `ADMIN_PASSWORD=${newPassword}`);

      writeEnvFile(filteredLines.join("\n"));
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Update ADMIN_PASSWORD in .htaccess file
 * @param {string} newPassword - New password to set
 * @returns {Promise<void>}
 */
const updateAdminPasswordInHtaccess = async newPassword => {
  return new Promise((resolve, reject) => {
    try {
      let htaccessContent = readHtaccessFile();

      if (!htaccessContent) {
        reject(new Error(".htaccess file not found or empty"));
        return;
      }

      // Remove existing ADMIN_PASSWORD line (handle various whitespace formats)
      const lines = htaccessContent.split("\n");
      const filteredLines = lines.filter(
        line => !line.trim().match(/^SetEnv\s+ADMIN_PASSWORD\s+/),
      );

      // Find ADMIN_USERNAME line to insert password after it
      let insertIndex = -1;
      for (let i = 0; i < filteredLines.length; i++) {
        if (filteredLines[i].trim().match(/^SetEnv\s+ADMIN_USERNAME\s+/)) {
          insertIndex = i + 1;
          break;
        }
      }

      // If ADMIN_USERNAME not found, try to find a good place to add both
      if (insertIndex === -1) {
        // Look for other SetEnv directives to add near them
        for (let i = 0; i < filteredLines.length; i++) {
          if (filteredLines[i].trim().startsWith("SetEnv")) {
            insertIndex = i + 1;
            break;
          }
        }
      }

      // If still not found, add at the end
      if (insertIndex === -1) {
        insertIndex = filteredLines.length;
      }

      // Insert password (use SetEnv directive format)
      filteredLines.splice(
        insertIndex,
        0,
        `SetEnv ADMIN_PASSWORD ${newPassword}`,
      );

      writeHtaccessFile(filteredLines.join("\n"));
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Update ADMIN_PASSWORD (works with both .env and .htaccess)
 * @param {string} newPassword - New password to set
 * @returns {Promise<void>}
 */
const updateAdminPassword = async newPassword => {
  if (isUsingHtaccess()) {
    return updateAdminPasswordInHtaccess(newPassword);
  } else {
    return updateAdminPasswordInEnv(newPassword);
  }
};

module.exports = {
  updateAdminPassword,
};
