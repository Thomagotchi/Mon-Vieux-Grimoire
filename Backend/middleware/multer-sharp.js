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
module.exports.resizeImage = async (req, res, next) => {
  // On vérifie si un fichier a été téléchargé
  if (!req.file) {
    return next();
  }

  const filePath = path.join(__dirname, "..", req.file.path);
  const outputFilePath = path.join("images", `resized_${req.file.filename}`);

  try {
    await sharp(filePath)
      .resize({ width: 206, height: 260 })
      .toFile(outputFilePath);

    // Supprime l'ancienne version de l'image
    fs.unlinkSync(filePath);
    req.file.path = outputFilePath;

    // Passe au prochain middleware
    next();
  } catch (error) {
    console.log(error);
    return next();
  }
};
