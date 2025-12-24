const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../public/uploads");
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("✅ Created uploads directory:", uploadsDir);
  }
} catch (error) {
  console.error("❌ Error creating uploads directory:", error);
  // Continue anyway - multer will handle the error
}

// temp storage of uploaded image files
module.exports = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      // Ensure directory exists before saving
      try {
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
      } catch (error) {
        console.error("❌ Error with uploads directory:", error);
        cb(error, null);
      }
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "-" + file.originalname);
    },
  }),
  fileFilter: (req, file, cb) => {
    // The function should call `cb` with a boolean
    // to indicate if the file should be accepted

    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image file types supported"), false);
      return;
    }

    // Otherwise accept the file
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});
