require("dotenv").config();

const express = require("express");
const session = require("express-session");
const compression = require("compression");

const csrf = require("csurf");

const sessionConfig = require("./utils/session");
const db = require("./data/db");

const path = require("path");

const authMiddleware = require("./middleware/auth-middleware");
const addCSRFTokenMiddleware = require("./middleware/csrf-token-middlware");
const errorsHandlerMiddleware = require("./middleware/error-handler");

const dynamicRoutes = require("./routes/dynamic");
const defaultRoutes = require("./routes/default");
const authRoutes = require("./routes/auth");

const mongodbSessionStore = sessionConfig.createSessionStore(session);

const app = express();

const PORT = process.env.PORT || 3000;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(compression());

app.use(
  express.static("public", {
    etag: true,
    maxAge: 31536000000,
    redirect: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// Middleware
// Sessions config
app.use(session(sessionConfig.createSessionConfig(mongodbSessionStore)));

// csrf
app.use(csrf());
app.use(addCSRFTokenMiddleware);

// Auth
app.use(authMiddleware);

// Routes
app.use(dynamicRoutes);
app.use(defaultRoutes);
app.use(authRoutes);

// app.use(errorsHandlerMiddleware.handleServerError);
// app.use(errorsHandlerMiddleware.handleNotFoundError);

app.use((req, res, next) => {
  res.status(404).render("404");
});
app.use((error, req, res, next) => {
  res.status(500).render("500");
});

// Connect to MongoDB when the server starts
db.connectToDatabase(function (err) {
  if (err) {
    console.error(err);
    process.exit();
  }

  // start the Express server
  app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
    console.log("http://localhost:3000");
  });
});
