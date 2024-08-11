const express = require("express");
const router = express.Router();

const userCtrl = require("../controllers/user");

// #region Post
router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);
// #endregion

module.exports = router;
