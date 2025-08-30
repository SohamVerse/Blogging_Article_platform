const express = require("express");
const { protect, admin } = require("../middleware/authMiddleware");
const {
  getAllUsers,
  updateUserStatus,
  getAllBlogs,
  getPendingReviewBlogs,
  moderateBlog,
  updateBlogStatus,
  getAdminStats
} = require("../controllers/adminController");

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(admin);

// User management
router.get("/users", getAllUsers);
router.patch("/users/:id", updateUserStatus);

// Blog management and moderation
router.get("/blogs", getAllBlogs);
router.get("/blogs/pending-review", getPendingReviewBlogs);
router.patch("/blogs/:id", updateBlogStatus);
router.post("/blogs/:id/moderate", moderateBlog);

// Analytics
router.get("/stats", getAdminStats);

module.exports = router; 