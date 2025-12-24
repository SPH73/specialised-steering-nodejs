// Load .env with explicit path to ensure it's loaded correctly
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

// Log environment variable status (without exposing values)
console.log("🔧 Environment check on startup:");
console.log("  AT_API_KEY:", process.env.AT_API_KEY ? `SET (length: ${process.env.AT_API_KEY.length})` : "NOT SET");
console.log("  BASE:", process.env.BASE || "NOT SET");
console.log("  EMAIL_HOST:", process.env.EMAIL_HOST || process.env.SMTP_HOST || "NOT SET");
console.log("  .env file location:", path.join(__dirname, ".env"));

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
    `{"group":"csp-endpoint","max_age":10886400,"endpoints":[{"url":"https://specialisedsteering.com/__cspreport__"}],"include_subdomains":true}`,
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

// Routes
app.use(dynamicRoutes);
app.use(defaultRoutes);

// app.use(errorsHandlerMiddleware.handleServerError);
// app.use(errorsHandlerMiddleware.handleNotFoundError);

app.use((req, res, next) => {
  res.status(404).render("404");
});
app.use((error, req, res, next) => {
  res.status(500).render("500");
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
  console.log(__dirname);
  console.log(`http://localhost:${PORT}`);
});
