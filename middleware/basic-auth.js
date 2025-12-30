/**
 * Basic authentication middleware
 * Uses ADMIN_USERNAME and ADMIN_PASSWORD environment variables
 */
const basicAuth = (req, res, next) => {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  // If credentials not configured, reject
  if (!username || !password) {
    console.warn("⚠️ Admin credentials not configured. Admin routes disabled.");
    return res
      .status(401)
      .json({ error: "Admin authentication not configured" });
  }

  // Get Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Admin Area"');
    return res.status(401).json({ error: "Authentication required" });
  }

  // Extract credentials from header
  const credentials = Buffer.from(authHeader.split(" ")[1], "base64").toString(
    "utf-8",
  );
  const [providedUsername, providedPassword] = credentials.split(":");

  // Verify credentials
  if (providedUsername === username && providedPassword === password) {
    next();
  } else {
    res.setHeader("WWW-Authenticate", 'Basic realm="Admin Area"');
    return res.status(401).json({ error: "Invalid credentials" });
  }
};

module.exports = basicAuth;
