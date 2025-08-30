const express = require("express");
const {
  createUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getProfile,
} = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", createUser);          // Register
router.post("/login", loginUser);      // Login

// ✅ Specific route FIRST
router.get("/profile", protect, getProfile);

// Generic routes AFTER
router.get("/", protect, getUsers);
router.get("/:id", protect, getUserById);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, admin, deleteUser);

module.exports = router;
