const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const { uploadImage, resizeImage } = require("../middleware/multer-sharp");

const bookCtrl = require("../controllers/book");

// #region Post
router.post("/", auth, uploadImage, resizeImage, bookCtrl.createBook);
router.post("/:id/rating", auth, bookCtrl.createRating);
// #endregion

// #region Delete
router.delete("/:id", auth, bookCtrl.deleteBook);
// #endregion

// #region Patch
router.put("/:id", auth, uploadImage, resizeImage, bookCtrl.updateBook);
// #endregion

// #region Put
// router.post("/:id/rating", auth, bookCtrl.createRating);
// #endregion

// #region Get
router.get("/", bookCtrl.getAllBooks);
router.get("/bestrating", bookCtrl.getBestBooks);
router.get("/:id", bookCtrl.getBookById);
// #endregion

module.exports = router;
