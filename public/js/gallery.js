/**
 * Gallery Layout Detection and Management
 * Automatically switches between grid and masonry layouts based on image aspect ratios
 */

(function () {
  "use strict";

  const GALLERY_SELECTOR = "#photo-gallery";
  const GALLERY_ITEM_SELECTOR = ".gallery-item";
  const PHOTO_SELECTOR = ".gallery-photo";
  const ASPECT_RATIO_THRESHOLD = 0.3; // 30% variation threshold
  const MIN_IMAGES_FOR_ANALYSIS = 3;

  /**
   * Calculate aspect ratio from width and height
   */
  function getAspectRatio(width, height) {
    if (!width || !height) return 1;
    return width / height;
  }

  /**
   * Check if aspect ratios are similar (within threshold)
   */
  function areAspectRatiosSimilar(ratios) {
    if (ratios.length < 2) return true;

    const sorted = ratios.sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const variation = (max - min) / min;

    return variation <= ASPECT_RATIO_THRESHOLD;
  }

  /**
   * Analyze images and determine best layout
   */
  function analyzeLayout(images) {
    if (images.length < MIN_IMAGES_FOR_ANALYSIS) {
      return "masonry"; // Default to masonry for brick layout
    }

    const aspectRatios = [];
    let loadedCount = 0;

    return new Promise(resolve => {
      images.forEach(img => {
        if (img.complete && img.naturalWidth > 0) {
          // Image already loaded
          const width = parseInt(img.dataset.width) || img.naturalWidth;
          const height = parseInt(img.dataset.height) || img.naturalHeight;
          const ratio = getAspectRatio(width, height);
          aspectRatios.push(ratio);
          loadedCount++;

          if (loadedCount === images.length) {
            resolve(areAspectRatiosSimilar(aspectRatios) ? "grid" : "masonry");
          }
        } else {
          // Wait for image to load
          img.addEventListener("load", function onLoad() {
            img.removeEventListener("load", onLoad);
            const width = parseInt(img.dataset.width) || img.naturalWidth;
            const height = parseInt(img.dataset.height) || img.naturalHeight;
            const ratio = getAspectRatio(width, height);
            aspectRatios.push(ratio);
            loadedCount++;

            if (loadedCount === images.length) {
              resolve(
                areAspectRatiosSimilar(aspectRatios) ? "grid" : "masonry",
              );
            }
          });

          // Handle load errors
          img.addEventListener("error", function onError() {
            img.removeEventListener("error", onError);
            // Use default aspect ratio for failed images
            aspectRatios.push(1);
            loadedCount++;

            if (loadedCount === images.length) {
              resolve(
                areAspectRatiosSimilar(aspectRatios) ? "grid" : "masonry",
              );
            }
          });
        }
      });

      // Fallback: if no images load within timeout, use masonry
      setTimeout(() => {
        if (loadedCount < images.length) {
          resolve("masonry");
        }
      }, 5000);
    });
  }

  /**
   * Apply layout to gallery
   */
  function applyLayout(gallery, layout) {
    gallery.setAttribute("data-layout", layout);
    gallery.classList.add(`layout-${layout}`);
  }

  /**
   * Handle image click for lightbox (optional enhancement)
   */
  function setupImageClickHandlers(items) {
    items.forEach(item => {
      const img = item.querySelector(PHOTO_SELECTOR);
      if (img) {
        img.addEventListener("click", function () {
          const fullUrl = img.dataset.src || img.src;
          // Open in new tab for now (can be enhanced with modal later)
          window.open(fullUrl, "_blank");
        });
      }
    });
  }

  /**
   * Initialize gallery
   */
  function initGallery() {
    const gallery = document.querySelector(GALLERY_SELECTOR);
    if (!gallery) {
      return; // Gallery not found on this page
    }

    const items = gallery.querySelectorAll(GALLERY_ITEM_SELECTOR);
    const images = gallery.querySelectorAll(PHOTO_SELECTOR);

    if (items.length === 0 || images.length === 0) {
      return; // No images to display
    }

    // Set up click handlers
    setupImageClickHandlers(items);

    // Analyze layout and apply
    analyzeLayout(Array.from(images))
      .then(layout => {
        applyLayout(gallery, layout);
        console.log(`Gallery layout set to: ${layout}`);
      })
      .catch(error => {
        console.error("Error analyzing gallery layout:", error);
        // Fallback to masonry
        applyLayout(gallery, "masonry");
      });

    // Lazy load full-resolution images
    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const fullUrl = img.dataset.src;
            if (fullUrl && img.src !== fullUrl) {
              img.src = fullUrl;
              img.removeAttribute("data-src");
            }
            observer.unobserve(img);
          }
        });
      });

      images.forEach(img => {
        if (img.dataset.src) {
          imageObserver.observe(img);
        }
      });
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGallery);
  } else {
    initGallery();
  }
})();
