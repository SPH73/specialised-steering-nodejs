/**
 * reCAPTCHA Verification Utility
 * Verifies reCAPTCHA v2 tokens server-side
 */

const https = require("https");

/**
 * Verify reCAPTCHA v2 token with Google
 * @param {string} token - reCAPTCHA response token from form submission
 * @param {string} secretKey - reCAPTCHA secret key from environment
 * @param {string} remoteip - User's IP address (optional but recommended)
 * @returns {Promise<Object>} - { success: boolean, score?: number, challenge_ts?: string, hostname?: string, error?: string }
 */
const verifyRecaptcha = async (token, secretKey, remoteip = null) => {
  if (!token || !secretKey) {
    return {
      success: false,
      error: "Missing reCAPTCHA token or secret key",
    };
  }

  const postData = `secret=${encodeURIComponent(
    secretKey,
  )}&response=${encodeURIComponent(token)}${
    remoteip ? `&remoteip=${encodeURIComponent(remoteip)}` : ""
  }`;

  return new Promise((resolve, reject) => {
    const options = {
      hostname: "www.google.com",
      port: 443,
      path: "/recaptcha/api/siteverify",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(postData),
      },
      timeout: 5000, // 5 second timeout
    };

    const req = https.request(options, res => {
      let data = "";

      res.on("data", chunk => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          resolve({
            success: false,
            error: "Failed to parse reCAPTCHA response",
          });
        }
      });
    });

    req.on("error", error => {
      console.error("reCAPTCHA verification error:", error);
      resolve({
        success: false,
        error: "Network error during reCAPTCHA verification",
      });
    });

    req.on("timeout", () => {
      req.destroy();
      resolve({
        success: false,
        error: "reCAPTCHA verification timeout",
      });
    });

    req.write(postData);
    req.end();
  });
};

/**
 * Verify reCAPTCHA from form submission
 * @param {Object} req - Express request object
 * @returns {Promise<Object>} - Verification result
 */
const verifyRecaptchaFromRequest = async req => {
  // Handle token as string or array (take first element if array)
  let token = req.body["g-recaptcha-response"];
  if (Array.isArray(token)) {
    // If token is an array, use the first element
    token = token[0];
    console.warn(
      "⚠️ reCAPTCHA token received as array, using first element",
    );
  }
  // Support both naming conventions
  const secretKey =
    process.env.RECAPTCHA_SECRET_KEY || process.env.reCAPTCHA_v2_SECRET_KEY;
  const remoteip = req.headers["x-forwarded-for"]?.split(",")[0] || req.ip;

  if (!secretKey) {
    console.warn(
      "⚠️ RECAPTCHA_SECRET_KEY or reCAPTCHA_v2_SECRET_KEY not set in environment",
    );
    return {
      success: false,
      error: "reCAPTCHA not configured",
    };
  }

  return await verifyRecaptcha(token, secretKey, remoteip);
};

module.exports = {
  verifyRecaptcha,
  verifyRecaptchaFromRequest,
};
