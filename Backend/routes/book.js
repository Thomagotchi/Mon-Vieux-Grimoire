const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

const bookCtrl = require("../controllers/book");
// #region Post
router.post("/", auth, multer, bookCtrl.createBook);
// #endregion

// #region Delete
router.delete("/:id", auth, bookCtrl.deleteBook);
// #endregion

// #region Patch
router.patch("/:id", auth, multer, bookCtrl.updateBook);
// #endregion

// #region Put
router.put("/:id/rating", auth, bookCtrl.createRating);
// #endregion

// #region Get
router.get("/", bookCtrl.getAllBooks);
router.get("/bestrating", bookCtrl.getBestBooks);
router.get("/:id", bookCtrl.getBookById);
// #endregion

module.exports = router;
