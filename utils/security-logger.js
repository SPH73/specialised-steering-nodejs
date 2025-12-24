/**
 * Security Event Logger
 * Logs reCAPTCHA failures, spam attempts, and CSP violations to Airtable
 */

const { Airtable } = require("./airtable");
const requestIp = require("request-ip");
require("dotenv").config();

let base = null;
try {
  if (process.env.BASE) {
    base = Airtable.base(process.env.BASE);
  }
} catch (error) {
  console.warn("⚠️ Failed to initialize Airtable base:", error.message);
}

/**
 * Log security event to Airtable
 * @param {Object} eventData - Event data to log
 * @param {string} eventData.type - Event type: 'recaptcha_failure', 'spam_detected', 'csp_violation', 'rate_limit'
 * @param {string} eventData.reason - Reason for the event
 * @param {Object} req - Express request object (optional)
 * @param {Object} eventData.additionalData - Additional data to log
 * @returns {Promise} - Airtable record creation result
 */
const logSecurityEvent = async (eventData, req = null) => {
  if (!base) {
    console.warn("⚠️ Airtable base not configured. Security event not logged.");
    return null;
  }

  const {
    type,
    reason,
    additionalData = {},
    formType = null,
    userAgent: providedUserAgent = null,
    referer: providedReferer = null,
  } = eventData;

  // Get client IP
  let clientIp = "unknown";
  let userAgent = providedUserAgent;
  let referer = providedReferer;

  if (req) {
    clientIp = requestIp.getClientIp(req);
    userAgent = req.get("user-agent") || userAgent;
    referer = req.get("referer") || referer;
  }

  const record = {
    timestamp: new Date().toISOString(),
    type: type,
    reason: reason || "Unknown",
    ipAddress: clientIp,
    userAgent: userAgent || "Unknown",
    referer: referer || "Unknown",
    formType: formType || "Unknown",
    additionalData: JSON.stringify(additionalData),
    status: "Logged",
  };

  try {
    const table = base("securityLogs");
    const createdRecord = await table.create(record);
    console.log(`✅ Security event logged to Airtable: ${type} - ${reason}`);
    return createdRecord;
  } catch (error) {
    console.error("❌ Failed to log security event to Airtable:", error);
    // Don't throw - logging failures shouldn't break the app
    return null;
  }
};

/**
 * Log reCAPTCHA verification failure
 * @param {Object} req - Express request object
 * @param {Object} recaptchaResult - reCAPTCHA verification result
 * @param {string} formType - Type of form ('contact' or 'enquiry')
 * @returns {Promise}
 */
const logRecaptchaFailure = async (req, recaptchaResult, formType) => {
  return await logSecurityEvent(
    {
      type: "recaptcha_failure",
      reason: recaptchaResult.error || "Invalid token",
      formType: formType,
      additionalData: {
        recaptchaError: recaptchaResult.error,
        recaptchaResponse: recaptchaResult,
      },
    },
    req,
  );
};

/**
 * Log spam detection
 * @param {Object} req - Express request object
 * @param {Object} spamCheck - Spam detection result
 * @param {string} formType - Type of form ('contact' or 'enquiry')
 * @param {Object} formData - Form data (sanitized - no sensitive info)
 * @returns {Promise}
 */
const logSpamAttempt = async (req, spamCheck, formType, formData = {}) => {
  // Sanitize form data - only include non-sensitive fields
  const sanitizedData = {
    name: formData.name || formData.enquiryName || "N/A",
    email: formData.email || formData.enquiryEmail || "N/A",
    company: formData.company || formData.enquiryCompany || "N/A",
    // Don't log message content for privacy, just length
    messageLength: formData.message
      ? formData.message.length
      : formData.enquiryMessage
      ? formData.enquiryMessage.length
      : 0,
  };

  return await logSecurityEvent(
    {
      type: "spam_detected",
      reason: spamCheck.reason || "Spam detected",
      formType: formType,
      additionalData: {
        spamReason: spamCheck.reason,
        formData: sanitizedData,
      },
    },
    req,
  );
};

/**
 * Log rate limit hit
 * @param {Object} req - Express request object
 * @param {string} formType - Type of form ('contact' or 'enquiry')
 * @returns {Promise}
 */
const logRateLimit = async (req, formType) => {
  return await logSecurityEvent(
    {
      type: "rate_limit",
      reason: "Too many requests from this IP",
      formType: formType,
    },
    req,
  );
};

/**
 * Log CSP violation
 * @param {Object} req - Express request object
 * @param {Object} violationData - CSP violation data from browser
 * @returns {Promise}
 */
const logCspViolation = async (req, violationData) => {
  return await logSecurityEvent(
    {
      type: "csp_violation",
      reason: violationData["violated-directive"] || "CSP violation",
      additionalData: {
        documentUri: violationData["document-uri"],
        violatedDirective: violationData["violated-directive"],
        blockedUri: violationData["blocked-uri"],
        originalPolicy: violationData["original-policy"],
      },
    },
    req,
  );
};

module.exports = {
  logSecurityEvent,
  logRecaptchaFailure,
  logSpamAttempt,
  logRateLimit,
  logCspViolation,
};
