/**
 * A/B Test Copy Variants
 * Meta descriptions and other copy for each test variant
 */

const COPY_VARIANTS = {
  // Homepage variants
  home: {
    A: {
      // Control - current copy
      title:
        "Hydraulic Repairs and Component Sourcing | Germiston, Gauteng, ZA - Service Worldwide",
      description:
        "We repair and source hydraulic components for a wide range of industries and applications. We also service, test and repair components to OEM specification. View our range and examples of client work.",
    },
    B: {
      // Near-me variant with locality emphasis
      title:
        "Hydraulic Repairs and Component Sourcing | Germiston, Gauteng, ZA - Service Worldwide",
      description:
        "Expert hydraulic repairs near Germiston for mining, agriculture & trucks. OEM-certified service exchange & component sourcing. 40+ years combined experience. Get a quote today.",
    },
  },

  // Our Work page variants
  ourWork: {
    A: {
      // Control - current copy
      title: "HYDRAULIC COMPONENT SERVICE EXCHANGE & REAIRS TO OEM SPEC",
      description:
        "We offer service exchange on some hydraulic components and repair all components to OEM specification on machinery and trucks for the mining and agricultural industries.",
    },
    B: {
      // Near-me variant with proof points
      title: "HYDRAULIC COMPONENT SERVICE EXCHANGE & REPAIRS TO OEM SPEC",
      description:
        "View our completed hydraulic repairs for mining & agricultural machinery. OEM-specification service exchange from Germiston. Underground & open pit mine experience. See our work.",
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
        "About Specialised Steering: Germiston's OEM-certified hydraulic repair specialists. Workshop & on-site service for underground mines, open pits & agriculture. 40+ years combined expertise.",
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
        "Contact Germiston's hydraulic repair experts. 40+ years experience servicing mining, agriculture & trucks worldwide. Call, email or visit us. Emergency repairs available.",
    },
  },

  // Enquiry page variants (for Phase 2 - not yet active)
  enquiry: {
    A: {
      // Control - current copy
      title:
        "HYDRAULIC COMPONENTS FOR MINING AND AGRICULTURAL MACHINERY AND TRUCKS",
      description:
        "We supply a wide range of industries with replacement hydraulic components from leading manufacturers. Fill out an enquiry form for the part you require and we will do our best to get you up and running again as soon as possible.",
    },
    B: {
      // Action-oriented CTA variant
      title:
        "HYDRAULIC COMPONENTS FOR MINING AND AGRICULTURAL MACHINERY AND TRUCKS",
      description:
        "Source hydraulic components fast. Simple enquiry form for mining, agriculture & truck parts from leading manufacturers. Expert guidance, competitive pricing. Get your quote today.",
    },
  },

  // Gallery page variants (Medium priority)
  gallery: {
    A: {
      // Control - current copy
      title: "Completed Jobs Photo Gallery | Specialised Steering",
      description:
        "Explore our hydraulic component completed repairs gallery showcasing our expertise in servicing the mining, agricultural, and automotive industries. View completed projects and see the quality of our work firsthand. Trust Specialised Steering for reliable hydraulic repairs tailored to your industry needs.",
    },
    B: {
      // Near-me with visual emphasis
      title: "Completed Jobs Photo Gallery | Specialised Steering",
      description:
        "Photo gallery of completed hydraulic repairs - Germiston workshop. Real projects from mining, agriculture & trucks. See OEM-quality work before/after. Browse our portfolio.",
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
  // For now, we only have the near_me_meta test active
  const variant = variants.near_me_meta || "A";
  return getCopyVariant(page, variant);
}

module.exports = {
  COPY_VARIANTS,
  getCopyVariant,
  getMetaForPage,
};
