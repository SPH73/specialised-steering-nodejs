/**
 * A/B Test Copy Variants
 * Meta descriptions and other copy for each test variant
 */

const COPY_VARIANTS = {
  // Homepage variants
  home: {
    A: {
      // Control – kept under 158 chars for snippet
      title:
        "Hydraulic Repairs and Component Sourcing | Germiston, Gauteng, ZA - Service Worldwide",
      description:
        "We repair and source hydraulic components for industrial, mining, agricultural and off-highway. OEM service exchange from Germiston. View our range and client work.",
    },
    B: {
      // Near-me variant – locality in first ~120 chars, total ≤158
      title:
        "Hydraulic Repairs and Component Sourcing | Germiston, Gauteng, ZA - Service Worldwide",
      description:
        "Expert hydraulic repairs near Germiston for industrial, mining, agricultural and off-highway. OEM service exchange & sourcing. 40+ years experience. Get a quote today.",
    },
    C: {
      // Nationwide emphasis – location + SA in first ~120 chars
      title: "Hydraulic Repair Shop | Germiston, Gauteng – Serving South Africa",
      description:
        "Based in Germiston – hydraulic repairs and service exchange across South Africa. OEM spec for industrial, mining, agricultural and off-highway. Nationwide service. Get a quote.",
    },
  },

  // Our Work page variants
  ourWork: {
    A: {
      // Control - current copy
      title: "HYDRAULIC COMPONENT RESTORATION, SERVICE EXCHANGE & REPAIRS TO OEM SPEC",
      description:
        "Hydraulic component restoration and service exchange. We repair all components to OEM specification for industrial, mining, agricultural and off-highway sectors.",
    },
    B: {
      // Near-me variant with proof points
      title: "HYDRAULIC COMPONENT RESTORATION, SERVICE EXCHANGE & REPAIRS TO OEM SPEC",
      description:
        "Hydraulic component restoration from Germiston. Completed repairs for industrial, mining, agricultural and off-highway. OEM-specification service exchange. Underground & open pit experience. See our work.",
    },
  },

  // About page variants
  about: {
    A: {
      // Control - current copy
      title:
        "Hydraulic Repairs to OEM Specification and Component Sourcing Service - Germiston, Gauteng",
      description:
        "Specialised Steering CC offer hydraulic repairs services and a service exchange on some hydraulic components from our Germiston OEM repair workshop as well as on-site in underground and open pit mines.",
    },
    B: {
      // Near-me variant with expertise emphasis
      title:
        "Hydraulic Repairs to OEM Specification and Component Sourcing Service - Germiston, Gauteng",
      description:
        "About Specialised Steering: Germiston's OEM-certified hydraulic repair specialists. Workshop & on-site service for industrial, mining, agricultural and off-highway. 40+ years combined expertise.",
    },
  },

  // Contact page variants
  contact: {
    A: {
      // Control - current copy
      title:
        "CONTACT US FOR ALL YOUR HYDRAULIC REPAIRS AND PART SERVICE EXCHANGE",
      description:
        "With our combined 40 years of experience, we offer an expert and professional service for all your hydraulic component requirements. Please contact us today to let us know how we can help get you back up and running.",
    },
    B: {
      // Near-me variant with multi-channel emphasis
      title:
        "CONTACT US FOR ALL YOUR HYDRAULIC REPAIRS AND PART SERVICE EXCHANGE",
      description:
        "Contact Germiston's hydraulic repair experts. 40+ years experience servicing industrial, mining, agricultural and off-highway. Call, email or visit us. Emergency repairs available.",
    },
  },

  // Enquiry page variants (for Phase 2 - not yet active)
  enquiry: {
    A: {
      // Control - current copy
      title:
        "HYDRAULIC COMPONENTS FOR INDUSTRIAL, MINING, AGRICULTURAL AND OFF-HIGHWAY",
      description:
        "We supply industrial, mining, agricultural and off-highway sectors with replacement hydraulic components from leading manufacturers. Fill out an enquiry form for the part you require and we will do our best to get you up and running again as soon as possible.",
    },
    B: {
      // Action-oriented CTA variant
      title:
        "HYDRAULIC COMPONENTS FOR INDUSTRIAL, MINING, AGRICULTURAL AND OFF-HIGHWAY",
      description:
        "Source hydraulic components fast. Simple enquiry form for industrial, mining, agricultural and off-highway parts from leading manufacturers. Expert guidance, competitive pricing. Get your quote today.",
    },
  },

  // Gallery page variants (Medium priority)
  gallery: {
    A: {
      // Control - current copy
      title: "Completed Jobs Photo Gallery | Specialised Steering",
      description:
        "Explore our hydraulic component completed repairs gallery showcasing our expertise in servicing industrial, mining, agricultural and off-highway sectors. View completed projects and see the quality of our work firsthand. Trust Specialised Steering for reliable hydraulic repairs tailored to your industry needs.",
    },
    B: {
      // Near-me with visual emphasis
      title: "Completed Jobs Photo Gallery | Specialised Steering",
      description:
        "Photo gallery of completed hydraulic repairs - Germiston workshop. Real projects from industrial, mining, agricultural and off-highway. See OEM-quality work before/after. Browse our portfolio.",
    },
  },
};

/**
 * Get copy variant for a page and variant
 *
 * @param {string} page - Page identifier (home, ourWork, about, contact, etc.)
 * @param {string} variant - Variant identifier (A, B, C, etc.)
 * @returns {Object} - Meta object with title and description
 */
function getCopyVariant(page, variant) {
  if (!COPY_VARIANTS[page]) {
    console.warn(`No copy variants defined for page: ${page}`);
    return null;
  }

  if (!COPY_VARIANTS[page][variant]) {
    console.warn(`No variant ${variant} defined for page: ${page}`);
    // Fallback to variant A (control)
    return COPY_VARIANTS[page]["A"] || null;
  }

  return COPY_VARIANTS[page][variant];
}

/**
 * Get meta object for a page based on active A/B tests
 *
 * @param {string} page - Page identifier
 * @param {Object} variants - Variant assignments from getVariantsForRoute()
 * @returns {Object} - Meta object with title and description
 */
function getMetaForPage(page, variants) {
  // Homepage uses variant C (location + South Africa in snippet); other pages use A/B test or default A
  const variant = page === "home" ? "C" : (variants.near_me_meta || "A");
  return getCopyVariant(page, variant);
}

module.exports = {
  COPY_VARIANTS,
  getCopyVariant,
  getMetaForPage,
};
