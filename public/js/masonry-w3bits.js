/**
 * W3Bits-style Masonry with CSS Grid
 * Source idea: https://w3bits.com/tools/masonry-generator/
 * Adapted for our gallery container and class names.
 */
(function () {
  "use strict";

  function resizeMasonryItem(item) {
    var grid = document.getElementsByClassName("masonry")[0];
    if (!grid || !item) return;

    var styles = window.getComputedStyle(grid);
    var rowGap = parseInt(styles.getPropertyValue("grid-row-gap"), 10) || 10;
    var rowHeight = parseInt(styles.getPropertyValue("grid-auto-rows"), 10) || 1;
    var content = item.querySelector(".masonry-content");

    if (!content) return;

    var contentHeight = content.getBoundingClientRect().height;

    // If height is 0 or very small, calculate from data attributes or natural dimensions
    if (!contentHeight || contentHeight < 10) {
      if (content.tagName === "IMG") {
        // Try data attributes first (full image dimensions)
        var imgWidth = parseInt(content.dataset.width) || 0;
        var imgHeight = parseInt(content.dataset.height) || 0;

        if (imgWidth > 0 && imgHeight > 0) {
          // Calculate height based on item width and aspect ratio
          var itemWidth = item.getBoundingClientRect().width || grid.getBoundingClientRect().width / 3 || 300;
          var aspectRatio = imgWidth / imgHeight;
          contentHeight = itemWidth / aspectRatio;
        } else if (content.naturalHeight > 0) {
          // Use natural dimensions if available
          contentHeight = content.naturalHeight;
        } else {
          // Fallback minimum height
          contentHeight = 300;
        }
      } else {
        contentHeight = 300; // fallback for non-images
      }
    }

    var rowSpan = Math.ceil((contentHeight + rowGap) / (rowHeight + rowGap));
    if (rowSpan < 1) rowSpan = 1;
    item.style.gridRowEnd = "span " + rowSpan;

    // Ensure image displays properly
    if (content && content.tagName === "IMG") {
      content.style.width = "100%";
      content.style.height = "auto";
      content.style.display = "block";
    }
  }

  function resizeAllMasonryItems() {
    var allItems = document.querySelectorAll(".masonry-item");
    if (!allItems || allItems.length === 0) return;
    for (var i = 0; i < allItems.length; i++) {
      resizeMasonryItem(allItems[i]);
    }
  }

  function waitForImages() {
    var allItems = document.querySelectorAll(".masonry-item");
    if (!allItems || allItems.length === 0) return;

    // Check if imagesLoaded is available
    if (typeof imagesLoaded === "function") {
      for (var i = 0; i < allItems.length; i++) {
        imagesLoaded(allItems[i], function (instance) {
          var item = instance.elements[0];
          resizeMasonryItem(item);
        });
      }
    } else {
      // Fallback: wait for all images to load naturally
      var images = document.querySelectorAll(".masonry-content");
      var loadedCount = 0;
      var totalImages = images.length;

      images.forEach(function(img) {
        if (img.complete) {
          loadedCount++;
          if (loadedCount === totalImages) {
            resizeAllMasonryItems();
          }
        } else {
          img.addEventListener("load", function() {
            loadedCount++;
            if (loadedCount === totalImages) {
              resizeAllMasonryItems();
            }
          });
        }
      });
    }
  }

  var masonryEvents = ["load", "resize"];
  masonryEvents.forEach(function (event) {
    window.addEventListener(event, resizeAllMasonryItems);
  });

  // Trigger once DOM is ready as well
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      resizeAllMasonryItems();
      waitForImages();
    });
  } else {
    resizeAllMasonryItems();
    waitForImages();
  }
})();


