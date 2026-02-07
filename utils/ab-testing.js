/**
 * A/B Testing Utility
 * Handles variant assignment, cookie persistence, and test configuration
 */

/**
 * A/B Test Registry
 * Define all active tests here
 */
const AB_TESTS = {
  // Near-me meta description test across high-priority pages
  nearMeMetaDescription: {
    id: "near_me_meta",
    name: "Near-me Meta Description Test",
    routes: ["/", "/our-work", "/about", "/contact"],
    variants: ["A", "B"],
    trafficSplit: 0.5, // 50/50 split
    active: true,
    startDate: "2026-01-26",
    description: "Test locality modifiers in meta descriptions for SERP CTR",
  },

  // Action-oriented CTA test (Phase 2 - not yet active)
  actionCTA: {
    id: "action_cta",
    name: "Action-Oriented CTA Test",
    routes: ["/enquiry", "/contact", "/"],
    variants: ["A", "B"],
    trafficSplit: 0.5,
    active: false,
    description: "Test passive vs. active CTAs in meta descriptions",
  },

  // Industry-specific landing test (Phase 3 - not yet active)
  industryFocus: {
    id: "industry_focus",
    name: "Industry-Specific Focus Test",
    routes: ["/", "/our-work"],
    variants: ["A", "B", "C"], // mining-first, agriculture-first, neutral
    trafficSplit: 0.33,
    active: false,
    description: "Test leading with different industries in descriptions",
  },
};

/**
 * Get variant assignment for a test
 * Uses cookie if exists, otherwise assigns randomly based on traffic split
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} testId - The test ID from AB_TESTS
 * @returns {string} - Variant identifier (A, B, C, etc.)
 */
function getVariant(req, res, testId) {
  const test = AB_TESTS[testId];

  if (!test || !test.active) {
    return "A"; // Default to control if test not found or inactive
  }

  const cookieName = `ab_${test.id}`;
  let variant = req.cookies[cookieName];

  // If variant already assigned via cookie, return it
  if (variant && test.variants.includes(variant)) {
    return variant;
  }

  // Assign new variant based on traffic split
  variant = assignVariant(test.variants, test.trafficSplit);

  // Set cookie for 90 days
  res.cookie(cookieName, variant, {
    maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days in milliseconds
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return variant;
}

/**
 * Assign a variant randomly based on traffic split
 *
 * @param {Array} variants - Array of variant identifiers
 * @param {number} trafficSplit - Percentage per variant (e.g., 0.5 for 50%)
 * @returns {string} - Selected variant
 */
function assignVariant(variants, trafficSplit) {
  const random = Math.random();
  const index = Math.floor(random / trafficSplit);
  return variants[Math.min(index, variants.length - 1)];
}

/**
 * Check if a route is part of an active test
 *
 * @param {string} route - The route path (e.g., "/", "/about")
 * @param {string} testId - The test ID to check
 * @returns {boolean}
 */
function isRouteInTest(route, testId) {
  const test = AB_TESTS[testId];
  return test && test.active && test.routes.includes(route);
}

/**
 * Get all active tests for a given route
 *
 * @param {string} route - The route path
 * @returns {Array} - Array of test IDs that apply to this route
 */
function getActiveTestsForRoute(route) {
  return Object.keys(AB_TESTS).filter((testId) => {
    const test = AB_TESTS[testId];
    return test.active && test.routes.includes(route);
  });
}

/**
 * Get variant assignments for all active tests on a route
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} route - The route path
 * @returns {Object} - Map of testId to variant (e.g., { near_me_meta: 'A' })
 */
function getVariantsForRoute(req, res, route) {
  const activeTests = getActiveTestsForRoute(route);
  const variants = {};

  activeTests.forEach((testId) => {
    variants[testId] = getVariant(req, res, testId);
  });

  return variants;
}

/**
 * Get test configuration
 *
 * @param {string} testId - The test ID
 * @returns {Object|null} - Test configuration or null if not found
 */
function getTestConfig(testId) {
  return AB_TESTS[testId] || null;
}

/**
 * Get all active tests
 *
 * @returns {Object} - Active tests only
 */
function getActiveTests() {
  return Object.keys(AB_TESTS)
    .filter((key) => AB_TESTS[key].active)
    .reduce((obj, key) => {
      obj[key] = AB_TESTS[key];
      return obj;
    }, {});
}

module.exports = {
  AB_TESTS,
  getVariant,
  isRouteInTest,
  getActiveTestsForRoute,
  getVariantsForRoute,
  getTestConfig,
  getActiveTests,
};
