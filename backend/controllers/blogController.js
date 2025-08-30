const BlogModel = require("../models/blogModel");
const UserModel = require("../models/userModel");

// Create new blog (submitted for review)
const createBlog = async (req, res) => {
  try {
    const { title, subtitle, content, tags, timeToRead, coverImage, isPublished } = req.body;
    
    if (!title || !content || content.length === 0) {
      return res.status(400).json({ 
        message: "Title and content are required" 
      });
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    // Check if slug already exists
    const existingBlog = await BlogModel.findOne({ slug });
    if (existingBlog) {
      return res.status(400).json({ 
        message: "A blog with this title already exists" 
      });
    }

    const blogData = {
      title,
      subtitle,
      slug,
      content,
      tags: tags || [],
      timeToRead: timeToRead || 5,
      coverImage,
      author: req.user._id,
      isPublished: false, // Always false initially
      status: 'pending_review', // Submit for review
      moderationStatus: 'pending'
    };

    const newBlog = new BlogModel(blogData);
    await newBlog.save();

    // Populate author information
    await newBlog.populate('author', 'username email');

    res.status(201).json({
      message: "Blog submitted for review successfully. It will be published after admin approval.",
      blog: newBlog
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get all published and approved blogs
const getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'latest', tag } = req.query;
    
    const query = { 
      status: 'approved',
      isPublished: true 
    };
    if (tag) {
      query.tags = { $in: [tag] };
    }

    let sortOption = {};
    switch (sort) {
      case 'latest':
        sortOption = { publishedAt: -1 };
        break;
      case 'popular':
        sortOption = { views: -1 };
        break;
      case 'trending':
        sortOption = { likeCount: -1 };
        break;
      default:
        sortOption = { publishedAt: -1 };
    }

    const blogs = await BlogModel.find(query)
      .populate('author', 'username email')
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await BlogModel.countDocuments(query);

    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get blog by ID (only approved and published)
const getBlogById = async (req, res) => {
  try {
    const blog = await BlogModel.findById(req.params.id)
      .populate('author', 'username email')
      .populate('likes', 'username');

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Only allow access to approved and published blogs
    if (blog.status !== 'approved' || !blog.isPublished) {
      return res.status(403).json({ message: "This blog is not available for viewing" });
    }

    // Increment view count
    blog.views += 1;
    await blog.save();

    res.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Update blog (only author can update)
const updateBlog = async (req, res) => {
  try {
    const { title, subtitle, content, tags, timeToRead, coverImage } = req.body;
    
    const blog = await BlogModel.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Check if user is the author
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this blog" });
    }

    // Only allow updates if blog is not under review or approved
    if (blog.status === 'pending_review' || blog.status === 'approved') {
      return res.status(400).json({ 
        message: "Cannot update blog while it's under review or approved" 
      });
    }

    // Generate new slug if title changed
    let slug = blog.slug;
    if (title && title !== blog.title) {
      slug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      
      // Check if new slug exists
      const existingBlog = await BlogModel.findOne({ slug, _id: { $ne: req.params.id } });
      if (existingBlog) {
        return res.status(400).json({ 
          message: "A blog with this title already exists" 
        });
      }
    }

    const updateData = {
      title: title || blog.title,
      subtitle: subtitle !== undefined ? subtitle : blog.subtitle,
      slug,
      content: content || blog.content,
      tags: tags || blog.tags,
      timeToRead: timeToRead || blog.timeToRead,
      coverImage: coverImage !== undefined ? coverImage : blog.coverImage
    };

    const updatedBlog = await BlogModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'username email');

    res.json({
      message: "Blog updated successfully",
      blog: updatedBlog
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Submit blog for review
const submitForReview = async (req, res) => {
  try {
    const blog = await BlogModel.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Check if user is the author
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to submit this blog" });
    }

    // Only allow submission if blog is in draft status
    if (blog.status !== 'draft') {
      return res.status(400).json({ 
        message: "Blog can only be submitted for review from draft status" 
      });
    }

    blog.status = 'pending_review';
    blog.moderationStatus = 'pending';
    blog.submittedForReview = new Date();
    await blog.save();

    res.json({
      message: "Blog submitted for review successfully",
      blog
    });
  } catch (error) {
    console.error('Error submitting blog for review:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Delete blog
const deleteBlog = async (req, res) => {
  try {
    const blog = await BlogModel.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Check if user is the author
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this blog" });
    }

    await BlogModel.findByIdAndDelete(req.params.id);

    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Like blog (only approved and published)
const likeBlog = async (req, res) => {
  try {
    const blog = await BlogModel.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (blog.status !== 'approved' || !blog.isPublished) {
      return res.status(400).json({ message: "Cannot like unpublished or unapproved blog" });
    }

    const userId = req.user._id;
    if (blog.likes.includes(userId)) {
      return res.status(400).json({ message: "Blog already liked" });
    }

    blog.likes.push(userId);
    await blog.save();

    res.json({ message: "Blog liked successfully" });
  } catch (error) {
    console.error('Error liking blog:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Unlike blog
const unlikeBlog = async (req, res) => {
  try {
    const blog = await BlogModel.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const userId = req.user._id;
    if (!blog.likes.includes(userId)) {
      return res.status(400).json({ message: "Blog not liked" });
    }

    blog.likes = blog.likes.filter(id => id.toString() !== userId.toString());
    await blog.save();

    res.json({ message: "Blog unliked successfully" });
  } catch (error) {
    console.error('Error unliking blog:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get user's blogs
const getUserBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;
    
    const query = { author: req.user._id };
    if (status !== 'all') {
      query.status = status;
    }

    const blogs = await BlogModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await BlogModel.countDocuments(query);

    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching user blogs:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Search blogs (only approved and published)
const searchBlogs = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const query = {
      status: 'approved',
      isPublished: true,
      $text: { $search: q }
    };

    const blogs = await BlogModel.find(query)
      .populate('author', 'username email')
      .sort({ score: { $meta: "textScore" } })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await BlogModel.countDocuments(query);

    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      query: q
    });
  } catch (error) {
    console.error('Error searching blogs:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

module.exports = {
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
}; 