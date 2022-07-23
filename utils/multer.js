const multer = require("multer");
// temp storage of uploaded image files
module.exports = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/uploads");
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
});
