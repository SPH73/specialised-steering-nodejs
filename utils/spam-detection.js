/**
 * Spam Detection Utility
 * Detects spam submissions including SEO/advertising spam
 */

// Common spam keywords and phrases (SEO services, advertising, etc.)
const SPAM_KEYWORDS = [
  // SEO and marketing services
  "seo services",
  "search engine optimization",
  "page ranking",
  "google ranking",
  "increase traffic",
  "backlinks",
  "link building",
  "organic traffic",
  "keyword research",
  "on-page seo",
  "off-page seo",
  "seo agency",
  "seo company",
  "digital marketing",
  "online marketing",
  "social media marketing",
  "ppc advertising",
  "pay per click",
  "adwords",
  "google ads",
  "facebook ads",
  "instagram followers",
  "youtube views",
  "website traffic",
  "boost ranking",
  "top ranking",
  "first page",
  "guaranteed ranking",
  // Generic advertising phrases
  "click here",
  "buy now",
  "limited time",
  "act now",
  "special offer",
  "free trial",
  "no credit card",
  "make money",
  "work from home",
  "get rich",
  "earn money",
  // Suspicious patterns
  "viagra",
  "cialis",
  "casino",
  "poker",
  "lottery",
  "winner",
  "prize",
  "congratulations",
  "you have won",
  "claim your prize",
];

// Suspicious email domains (disposable/temporary emails)
const SUSPICIOUS_EMAIL_DOMAINS = [
  "tempmail",
  "guerrillamail",
  "mailinator",
  "10minutemail",
  "throwaway",
  "trashmail",
  "mohmal",
  "fakeinbox",
  "getnada",
  "maildrop",
];

/**
 * Check if text contains spam keywords
 * @param {string} text - Text to check
 * @returns {boolean} - True if spam detected
 */
const containsSpamKeywords = text => {
  if (!text || typeof text !== "string") return false;
  const lowerText = text.toLowerCase();
  return SPAM_KEYWORDS.some(keyword => lowerText.includes(keyword));
};

/**
 * Check if email domain is suspicious
 * @param {string} email - Email address to check
 * @returns {boolean} - True if suspicious
 */
const isSuspiciousEmail = email => {
  if (!email || typeof email !== "string") return false;
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  return SUSPICIOUS_EMAIL_DOMAINS.some(suspicious =>
    domain.includes(suspicious),
  );
};

/**
 * Check if submission is too fast (likely bot)
 * @param {number} formLoadTime - Timestamp when form was loaded
 * @param {number} minTimeSeconds - Minimum time in seconds (default: 3)
 * @returns {boolean} - True if submission is too fast
 */
const isTooFast = (formLoadTime, minTimeSeconds = 3) => {
  if (!formLoadTime) return true; // No timestamp = suspicious
  const submitTime = Date.now();
  const timeDiff = (submitTime - formLoadTime) / 1000; // Convert to seconds
  return timeDiff < minTimeSeconds;
};

/**
 * Check if honeypot field was filled (bot detection)
 * @param {string} honeypotValue - Value from honeypot field
 * @returns {boolean} - True if honeypot was filled (spam)
 */
const isHoneypotFilled = honeypotValue => {
  return honeypotValue && honeypotValue.trim().length > 0;
};

/**
 * Comprehensive spam check
 * @param {Object} formData - Form submission data
 * @param {Object} options - Additional options (honeypot, formLoadTime, etc.)
 * @returns {Object} - { isSpam: boolean, reason: string }
 */
const detectSpam = (formData, options = {}) => {
  const {
    honeypot,
    formLoadTime,
    minTimeSeconds = 3,
    checkEmail = true,
    checkKeywords = true,
    checkSpeed = true,
    checkHoneypot = true,
  } = options;

  // Check honeypot
  if (checkHoneypot && isHoneypotFilled(honeypot)) {
    return {
      isSpam: true,
      reason: "Honeypot field was filled (bot detected)",
    };
  }

  // Check submission speed
  if (checkSpeed && isTooFast(formLoadTime, minTimeSeconds)) {
    return {
      isSpam: true,
      reason: `Submission too fast (less than ${minTimeSeconds} seconds)`,
    };
  }

  // Check email domain
  if (checkEmail && formData.email && isSuspiciousEmail(formData.email)) {
    return {
      isSpam: true,
      reason: "Suspicious email domain detected",
    };
  }

  // Check for spam keywords in all text fields
  if (checkKeywords) {
    const textFields = [
      formData.name,
      formData.company,
      formData.message,
      formData.enquiryMessage,
      formData.brand,
      formData.type,
      formData.partDesc,
      formData.partNo,
    ].filter(Boolean);

    for (const field of textFields) {
      if (containsSpamKeywords(field)) {
        return {
          isSpam: true,
          reason: "Spam keywords detected in form submission",
        };
      }
    }
  }

  return { isSpam: false, reason: null };
};

module.exports = {
  detectSpam,
  containsSpamKeywords,
  isSuspiciousEmail,
  isTooFast,
  isHoneypotFilled,
};
