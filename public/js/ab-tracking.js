/**
 * Client-side A/B Test Tracking
 * Sends GA4 events for test exposures and conversions
 */

(function () {
  "use strict";

  // Check if gtag is available (Google Analytics loaded)
  if (typeof gtag === "undefined") {
    console.warn("Google Analytics (gtag) not loaded - A/B tracking disabled");
    return;
  }

  /**
   * Track A/B test exposure (user sees a variant)
   */
  function trackExposure(testId, variant, route) {
    gtag("event", "ab_exposure", {
      test_id: testId,
      variant: variant,
      page_path: route || window.location.pathname,
      event_category: "ab_testing",
      event_label: `${testId}_${variant}`,
    });

    console.log("A/B exposure tracked:", { testId, variant, route });
  }

  /**
   * Track A/B test conversion (user completes goal action)
   */
  function trackConversion(testId, variant, conversionType, metadata = {}) {
    gtag("event", "ab_conversion", {
      test_id: testId,
      variant: variant,
      conversion_type: conversionType,
      page_path: window.location.pathname,
      event_category: "ab_testing",
      event_label: `${testId}_${variant}_${conversionType}`,
      ...metadata,
    });

    console.log("A/B conversion tracked:", {
      testId,
      variant,
      conversionType,
      metadata,
    });
  }

  /**
   * Read cookie value
   */
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

  /**
   * Track page view exposure on load
   */
  function trackPageViewExposure() {
    const route = window.location.pathname;

    // Check for active A/B test cookies
    const nearMeVariant = getCookie("ab_near_me_meta");

    if (nearMeVariant) {
      trackExposure("near_me_meta", nearMeVariant, route);
    }

    // Add other test checks here as they become active
  }

  /**
   * Track form submission conversions
   */
  function setupConversionTracking() {
    // Track contact form submissions
    const contactForm = document.querySelector('form[action="/contact"]');
    if (contactForm) {
      contactForm.addEventListener("submit", function () {
        const variant = getCookie("ab_near_me_meta");
        if (variant) {
          trackConversion("near_me_meta", variant, "contact_form_submit");
        }
      });
    }

    // Track enquiry form submissions
    const enquiryForm = document.querySelector('form[action="/enquiry"]');
    if (enquiryForm) {
      enquiryForm.addEventListener("submit", function () {
        const variant = getCookie("ab_near_me_meta");
        if (variant) {
          trackConversion("near_me_meta", variant, "enquiry_form_submit");
        }
      });
    }

    // Track phone number clicks (if tracked)
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    phoneLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        const variant = getCookie("ab_near_me_meta");
        if (variant) {
          trackConversion("near_me_meta", variant, "phone_click");
        }
      });
    });
  }

  // Initialize on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      trackPageViewExposure();
      setupConversionTracking();
    });
  } else {
    // DOM already loaded
    trackPageViewExposure();
    setupConversionTracking();
  }

  // Expose functions globally if needed for manual tracking
  window.abTracking = {
    trackExposure: trackExposure,
    trackConversion: trackConversion,
  };
})();
