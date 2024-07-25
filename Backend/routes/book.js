const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

const bookCtrl = require("../controllers/book");

router.post("/", auth, multer, bookCtrl.createBook);
router.delete("/:id", auth, bookCtrl.deleteBook);
router.patch("/:id", auth, multer, bookCtrl.updateBook);
router.get("/:id", bookCtrl.getBookById);
router.get("/bestrating", bookCtrl.getBestBooks);
router.put("/:id/rating", auth, bookCtrl.createRating);
router.get("/", bookCtrl.getAllBooks);

module.exports = router;
