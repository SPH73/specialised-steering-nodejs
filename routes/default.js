const express = require("express");
const router = express.Router();

// Google Photos integration - handle gracefully if module not available
let getAlbumPhotos = null;
try {
  // Check if googleapis is available first
  require("googleapis");
  const googlePhotos = require("../utils/google-photos");
  getAlbumPhotos = googlePhotos.getAlbumPhotos;
} catch (error) {
  console.warn("⚠️ Google Photos utility not available:", error.message);
  console.warn("⚠️ Gallery will show error message. Install 'googleapis' package and configure credentials.json to enable.");
  getAlbumPhotos = null;
}

router.get("/about", (req, res) => {
  const meta = {
    title:
      "Hydraulic Repairs to OEM Specification and Component Sourcing Service - Germiston, Gauteng",
    description:
      "Specialised Steering CC offer hydraulic repairs services and a service exchange on some hydraulic components from our Germiston OEM repair workshop as well as on-site in underground and open pit mines.",
  };
  res.render("about", { meta: meta });
});

router.get("/gallery", async (req, res) => {
  const meta = {
    title: "Completed Jobs Photo Gallery | Specialised Steering",
    description:
      "Explore our hydraulic component completed repairs gallery showcasing our expertise in servicing the mining, agricultural, and automotive industries. View completed projects and see the quality of our work firsthand. Trust Specialised Steering for reliable hydraulic repairs tailored to your industry needs.",
  };

  const albumId = process.env.GOOGLE_PHOTOS_ALBUM_ID;
  let photos = [];
  let error = null;

  // Check if Google Photos is configured
  if (!getAlbumPhotos) {
    error = "Google Photos integration is not configured. Please ensure the google-photos utility is available.";
    console.error(error);
  } else if (!albumId) {
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
      console.error("Error details:", err.message);

      // Provide helpful error messages based on the error type
      if (err.message && err.message.includes("Token file not found")) {
        error = "Google Photos authentication required. Please run the setup script to authenticate.";
      } else if (err.message && err.message.includes("Failed to load Google API credentials")) {
        error = "Google Photos credentials not found. Please ensure credentials.json exists.";
      } else if (err.message && err.message.includes("refresh")) {
        error = "Google Photos authentication expired. Please re-authenticate.";
      } else {
        error = "Unable to load gallery photos at this time. Please try again later.";
      }
    }
  }

  res.render("gallery", {
    meta: meta,
    photos: photos,
    error: error,
    hasPhotos: photos.length > 0,
  });
});

router.get("/sitemap.xml", (req, res) => {
  const baseUrl = "https://www.specialisedsteering.com";
  const today = new Date().toISOString().split("T")[0];
  
  // Static pages - exclude forms (/contact, /enquiry) to prevent spam
  const staticPages = [
    { url: "", priority: "1.0", changefreq: "weekly" }, // Homepage
    { url: "/about", priority: "0.8", changefreq: "monthly" },
    { url: "/our-work", priority: "0.8", changefreq: "weekly" },
    { url: "/gallery", priority: "0.7", changefreq: "weekly" },
    { url: "/privacy-policy", priority: "0.6", changefreq: "yearly" },
    { url: "/terms-of-sale", priority: "0.6", changefreq: "yearly" },
    { url: "/cookie-policy", priority: "0.5", changefreq: "yearly" },
    { url: "/disclaimer", priority: "0.5", changefreq: "yearly" },
    { url: "/sitemap", priority: "0.3", changefreq: "monthly" },
  ];

  // Generate XML sitemap
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  staticPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  
  res.set("Content-Type", "text/xml");
  res.send(xml);
});

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

router.get("/privacy-policy", (req, res) => {
  const meta = {
    title: "Privacy Policy | Specialised Steering CC",
    description: "Privacy Policy for Specialised Steering CC. Learn how we collect, use, and protect your personal information.",
  };
  res.render("privacy-policy", { meta: meta });
});

router.get("/terms-of-sale", (req, res) => {
  const meta = {
    title: "Terms of Sale | Specialised Steering CC",
    description: "Terms of Sale for Specialised Steering CC. Review our terms and conditions for purchasing goods and services.",
  };
  res.render("terms-of-sale", { meta: meta });
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
