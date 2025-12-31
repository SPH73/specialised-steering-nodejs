const fs = require("fs");
const path = require("path");

const ENV_FILE = path.join(__dirname, "..", ".env");

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
 * Write .env file content
 * @param {string} content - File content to write
 */
function writeEnvFile(content) {
  fs.writeFileSync(ENV_FILE, content, "utf8");
}

/**
 * Update ADMIN_PASSWORD in .env file
 * @param {string} newPassword - New password to set
 * @returns {Promise<void>}
 */
const updateAdminPassword = async newPassword => {
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

module.exports = {
  updateAdminPassword,
};
