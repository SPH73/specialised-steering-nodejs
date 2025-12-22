const express = require("express");
const router = express.Router();
// Google Photos integration available if needed
// const { getAlbumPhotos } = require("../utils/google-photos");

router.get("/about", (req, res) => {
  const meta = {
    title:
      "Hydraulic Repairs to OEM Specification and Component Sourcing Service - Germiston, Gauteng",
    description:
      "Specialised Steering CC offer hydraulic repairs services and a service exchange on some hydraulic components from our Germiston OEM repair workshop as well as on-site in underground and open pit mines.",
  };
  res.render("about", { meta: meta });
});

// Gallery route is in routes/dynamic.js (using Airtable images)
// Google Photos version commented out below - uncomment if you want to use Google Photos instead
/*
router.get("/gallery", async (req, res) => {
  const meta = {
    title: "Completed Jobs Photo Gallery | Specialised Steering",
    description:
      "Explore our hydraulic component completed repairs gallery showcasing our expertise in servicing the mining, agricultural, and automotive industries. View completed projects and see the quality of our work firsthand. Trust Specialised Steering for reliable hydraulic repairs tailored to your industry needs.",
  };

  const albumId = process.env.GOOGLE_PHOTOS_ALBUM_ID;
  let photos = [];
  let error = null;

  if (!albumId) {
    error = "Gallery album not configured. Please set GOOGLE_PHOTOS_ALBUM_ID in environment variables.";
    console.warn(error);
  } else {
    try {
      photos = await getAlbumPhotos(albumId);
      if (photos.length === 0) {
        error = "No photos found in the specified album.";
      }
    } catch (err) {
      console.error("Error fetching gallery photos:", err);
      error = "Unable to load gallery photos at this time. Please try again later.";
    }
  }

  res.render("gallery", {
    meta: meta,
    photos: photos,
    error: error,
    hasPhotos: photos.length > 0,
  });
});
*/

router.get("/sitemap", (req, res) => {
  const meta = {
    title: "specialisedsteering.com Site Map",
  };
  res.render("sitemap", { meta: meta });
});

router.get("/disclaimer", (req, res) => {
  const meta = {
    title: "SPECIALISED STEERING CC",
  };
  res.render("disclaimer", { meta: meta });
});

router.get("/cookie-policy", (req, res) => {
  const meta = {
    title: "Cookie Policy",
  };
  res.render("cookie-policy", { meta: meta });
});

router.post("/__cspreport__", (req, res) => {
  // CSP violations are sent as JSON in the body
  const report = req.body;

  if (report && report["csp-report"]) {
    const violation = report["csp-report"];
    console.log("=== CSP VIOLATION REPORT ===");
    console.log("Document URI:", violation["document-uri"]);
    console.log("Violated Directive:", violation["violated-directive"]);
    console.log("Blocked URI:", violation["blocked-uri"]);
    console.log("Source File:", violation["source-file"] || "N/A");
    console.log("Line Number:", violation["line-number"] || "N/A");
    console.log("===========================");
  } else {
    console.log("CSP Report received:", JSON.stringify(report, null, 2));
  }

  // Always return 204 No Content for CSP reports
  res.status(204).send();
});

module.exports = router;
