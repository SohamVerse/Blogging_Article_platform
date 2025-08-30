const express = require("express");
const { logoutUser,loginUser,refreshAccessToken,forgotPassword, resetPassword } = require("../controllers/authController");

const { protect, admin } = require("../middleware/authMiddleware");
const router = express.Router();
router.post("/login", loginUser);
router.post("/refresh", refreshAccessToken);
router.post("/logout", protect, logoutUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset/:token", resetPassword);

module.exports = router;