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
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
  },
});

// Upload de l'image
const uploadImage = multer({
  storage: storage,
  fileFilter: (req, file, callback) => {
    if (MIME_TYPES[file.mimetype]) {
      callback(null, true);
    } else {
      callback(new Error("Type de fichier invalide !"));
    }
  },
}).single("image");

// Redimensionnement de l'image
const resizeImage = (req, res, next) => {
  // On vérifie si un fichier a été téléchargé
  if (!req.file) {
    return next();
  }

  const filePath = path.join(__dirname, "..", req.file.path);

  console.log(filePath);

  sharp.cache(false);

  sharp(filePath)
    .resize({ width: 206, height: 260 })
    .toBuffer()
    .then((data) => {
      sharp(data)
        .toFile(filePath)
        .then(() => {
          // Passe au prochain middleware
          next();
        })
        .catch((error) => {
          next(error);
        });
    });
};

module.exports = {
  uploadImage,
  resizeImage,
};
