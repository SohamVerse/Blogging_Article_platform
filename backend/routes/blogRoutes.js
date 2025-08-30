const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  submitForReview,
  deleteBlog,
  likeBlog,
  unlikeBlog,
  getUserBlogs,
  searchBlogs
} = require("../controllers/blogController");

const router = express.Router();

// Public routes
router.get("/", getBlogs);
router.get("/search", searchBlogs);
router.get("/:id", getBlogById);

// Protected routes
router.use(protect);
router.post("/", createBlog);
router.get("/user/me", getUserBlogs);
router.put("/:id", updateBlog);
router.post("/:id/submit-review", submitForReview);
router.delete("/:id", deleteBlog);
router.post("/:id/like", likeBlog);
router.delete("/:id/like", unlikeBlog);

module.exports = router; 