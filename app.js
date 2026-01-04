// Load .env with explicit path to ensure it's loaded correctly
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

// Log environment variable status on startup (without exposing values)
if (process.env.NODE_ENV !== "production") {
  console.log("Environment check:");
  console.log(
    "  AT_API_KEY:",
    process.env.AT_API_KEY
      ? `SET (length: ${process.env.AT_API_KEY.length})`
      : "NOT SET",
  );
  console.log("  BASE:", process.env.BASE || "NOT SET");
  console.log(
    "  EMAIL_HOST:",
    process.env.EMAIL_HOST || process.env.SMTP_HOST || "NOT SET",
  );
}

const express = require("express");
const compression = require("compression");
const favicon = require("serve-favicon");
const cookieParser = require("cookie-parser");

const errorsHandlerMiddleware = require("./middleware/error-handler");

const dynamicRoutes = require("./routes/dynamic");
const defaultRoutes = require("./routes/default");

const PORT = process.env.PORT || 3300;

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use((req, res, next) => {
  res.setHeader(
    "Report-To",
    `{"group":"csp-endpoint","max_age":10886400,"endpoints":[{"url":"https://www.specialisedsteering.com/__cspreport__"}],"include_subdomains":true}`,
  );
  res.setHeader(
    "Content-Security-Policy-Report-Only",
    "default-src 'self'; font-src 'self'; img-src 'self' https://googletagmanager.com https://cdn-cookieyes.com https://dl.airtable.com https://res.cloudinary.com https://sswebimages.mo.cloudinary.net; script-src 'self' 'unsafe-inline' https://cdn-cookieyes.com https://region1.google-analytics.com/ https://www.recaptcha.net https://www.gstatic.com https://www.googletagmanager.com https://ajax.googleapis.com https://d3e54v103j8qbb.cloudfront.net; style-src 'self' 'unsafe-inline'; frame-src 'self' https://cdn-cookieyes.com https://www.recaptcha.net; connect-src 'self' https://consentlog.cookieyes.com https://active.cookieyes.com/api/fc1fd1fcf281525614c1466b/log https://log.cookieyes.com https://cdn-cookieyes.com https://region1.google-analytics.com/; script-src-elem 'self' 'unsafe-inline' https://cdn-cookieyes.com https://www.recaptcha.net https://www.googletagmanager.com https://www.gstatic.com https://ajax.googleapis.com https://d3e54v103j8qbb.cloudfront.net",
  );
  res.setHeader("set-cookie", [
    "_ga:GA1.1.376191239.1659268542; SameSite=Strict",
    "_ga_V4W8VP4GL8:GA1.1.376191239.1659268542; SameSite=Strict",
    "_GRECAPTCHA=09AMjm62UjUi9gunpNhie9zFn-6UPNnedIXhe3Y603QUMzv_HaMV83xZxO1UNsxkL3TaxfRB1N9CS4Gws4xoiXDCw; SameSite=None; Secure; Domain=www.recaptcha.net; Path=/recaptcha",
  ]);
  next();
});

app.use(cookieParser());

app.use(compression());

app.use(
  express.static("public", {
    etag: true,
    maxAge: 31536000000,
    lastModified: true,
  }),
);
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(express.json({ limit: "10mb" }));
// Use extended: true for better compatibility with form submissions
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Block WordPress/Elementor query parameters - return 410 Gone to signal permanent removal
// 410 Gone tells search engines the resource is permanently removed and should be de-indexed
app.use((req, res, next) => {
  // WordPress/Elementor query parameters that indicate WordPress artifacts
  const wordpressParams = [
    "elementor_library", // Elementor template library
    "elementor-preview", // Elementor preview mode
    "preview_id", // WordPress preview with ID
    "wpml_lang", // WPML multilingual plugin
    "preview", // WordPress preview mode (when combined with other WP params)
    "post_type", // WordPress post type
    "page_id", // WordPress page ID
  ];

  const hasWordPressParam = wordpressParams.some(param => req.query[param]);

  if (hasWordPressParam) {
    return res.status(410).render("410");
  }
  next();
});

// Password reset routes (public, no auth required)
const passwordResetRoutes = require("./routes/password-reset");
app.use("/admin", passwordResetRoutes);

// Admin routes (protected with basic auth)
const basicAuth = require("./middleware/basic-auth");
const adminRoutes = require("./routes/admin");
app.use("/admin", basicAuth, adminRoutes);

// Routes
app.use(dynamicRoutes);
app.use(defaultRoutes);

// app.use(errorsHandlerMiddleware.handleServerError);
// app.use(errorsHandlerMiddleware.handleNotFoundError);

app.use((req, res, next) => {
  res.status(404).render("404");
});
app.use((error, req, res, next) => {
  console.error("❌ 500 Error:", error.message);
  console.error("❌ Error stack:", error.stack);
  console.error("❌ Request URL:", req.url);
  res.status(500).render("500");
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
  console.log(__dirname);
  console.log(`http://localhost:${PORT}`);
});
