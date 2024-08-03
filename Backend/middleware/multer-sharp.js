const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

// Types de fichiers accepté
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

// Enregistrement des images
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },

  // Noms des images
  filename: (req, file, callback) => {
    const name = file.originalname.replace(/[\s.]+/g, "_");
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
  },
});

module.exports = multer({ storage: storage }).single("image");

// Redimensionnement de l'image
module.exports.resizeImage = (req, res, next) => {
  // Si aucun fichier, cela r'envoie vers le prochain middleware
  if (!req.file) {
    return next();
  }

  const filePath = req.file.path;
  const fileName = req.file.filename;
  const newFilePath = path.join("images", `resized_${fileName}`);

  sharp(filePath)
    .resize({ width: 206, height: 260 })
    .toFile(newFilePath)
    .then(() => {
      fs.unlink(filePath, () => {
        req.file.path = newFilePath;
        next();
      });
    })
    .catch((err) => {
      console.log(err);
      return next();
    });
};
