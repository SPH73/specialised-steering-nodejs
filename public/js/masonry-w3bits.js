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

    // Ensure we have valid dimensions
    if (!contentHeight || contentHeight === 0) {
      contentHeight = content.naturalHeight || 300; // fallback
    }

    var rowSpan = Math.ceil((contentHeight + rowGap) / (rowHeight + rowGap));
    item.style.gridRowEnd = "span " + rowSpan;

    // Don't force image height - let it be natural
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


