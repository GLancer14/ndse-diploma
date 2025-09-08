const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    fs.readdir("src/public/images", (err, files) => {
      if (err) {
        throw err;
      }

      if (!files.includes(req.user.id)) {
        fs.mkdirSync(`src/public/images/${req.user.id}`);
      }

      cb(null, `src/public/images/${req.user.id}`);
    });
    
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

module.exports = multer({ storage, fileFilter });