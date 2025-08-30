const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  loginUser,
  logoutUser,
  refreshToken,
  verifyToken,
  forgotPassword,
  resetPassword
} = require("../controllers/authController");

const router = express.Router();

// Public routes
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refresh", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes
router.get("/verify", protect, verifyToken);

module.exports = router;