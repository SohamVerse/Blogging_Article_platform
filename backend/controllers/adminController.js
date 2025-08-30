const UserModel = require("../models/userModel");
const BlogModel = require("../models/blogModel");

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find({}, '-password')
      .sort({ createdAt: -1 });

    res.json({
      users,
      total: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Update user status (activate/deactivate)
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ 
        message: "isActive must be a boolean value" 
      });
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent admin from deactivating themselves
    if (user.role === 'admin' && user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ 
        message: "Cannot deactivate your own admin account" 
      });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get all blogs (including pending review)
const getAllBlogs = async (req, res) => {
  try {
    const { status, moderationStatus, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (moderationStatus) query.moderationStatus = moderationStatus;

    const blogs = await BlogModel.find(query)
      .populate('author', 'username email')
      .sort({ submittedForReview: -1, createdAt: -1 })
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

// Get blogs pending review
const getPendingReviewBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const query = { 
      status: 'pending_review',
      moderationStatus: 'pending'
    };

    const blogs = await BlogModel.find(query)
      .populate('author', 'username email')
      .sort({ submittedForReview: -1 })
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
    console.error('Error fetching pending review blogs:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Review and moderate blog
const moderateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      action, 
      moderationFlags, 
      adminNotes, 
      rejectionReason,
      contentScore 
    } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ 
        message: "Action must be either 'approve' or 'reject'" 
      });
    }

    const blog = await BlogModel.findById(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (blog.status !== 'pending_review') {
      return res.status(400).json({ 
        message: "Blog is not pending review" 
      });
    }

    // Update blog based on action
    if (action === 'approve') {
      blog.status = 'approved';
      blog.moderationStatus = 'approved';
      blog.isPublished = true;
      blog.reviewedBy = req.user._id;
      blog.reviewedAt = new Date();
      blog.adminNotes = adminNotes || '';
      blog.contentScore = contentScore || 0;
      blog.publishedAt = new Date();
    } else if (action === 'reject') {
      blog.status = 'rejected';
      blog.moderationStatus = 'rejected';
      blog.reviewedBy = req.user._id;
      blog.reviewedAt = new Date();
      blog.adminNotes = adminNotes || '';
      blog.moderationFlags = moderationFlags || [];
      blog.rejectionReason = rejectionReason || '';
      blog.contentScore = contentScore || 0;
    }

    await blog.save();

    res.json({
      message: `Blog ${action}d successfully`,
      blog: {
        _id: blog._id,
        title: blog.title,
        status: blog.status,
        moderationStatus: blog.moderationStatus,
        reviewedBy: blog.reviewedBy,
        reviewedAt: blog.reviewedAt,
        adminNotes: blog.adminNotes,
        moderationFlags: blog.moderationFlags,
        rejectionReason: blog.rejectionReason,
        contentScore: blog.contentScore
      }
    });
  } catch (error) {
    console.error('Error moderating blog:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Update blog status (publish/unpublish)
const updateBlogStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;

    if (typeof isPublished !== 'boolean') {
      return res.status(400).json({ 
        message: "isPublished must be a boolean value" 
      });
    }

    const blog = await BlogModel.findById(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Only allow publishing if blog is approved
    if (isPublished && blog.status !== 'approved') {
      return res.status(400).json({ 
        message: "Only approved blogs can be published" 
      });
    }

    blog.isPublished = isPublished;
    
    // Set publishedAt when publishing
    if (isPublished && !blog.publishedAt) {
      blog.publishedAt = new Date();
    }

    await blog.save();

    res.json({
      message: `Blog ${isPublished ? 'published' : 'unpublished'} successfully`,
      blog: {
        _id: blog._id,
        title: blog.title,
        isPublished: blog.isPublished,
        publishedAt: blog.publishedAt
      }
    });
  } catch (error) {
    console.error('Error updating blog status:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get admin statistics
const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalBlogs,
      pendingReviewBlogs,
      approvedBlogs,
      rejectedBlogs,
      publishedBlogs,
      draftBlogs,
      totalViews,
      totalLikes
    ] = await Promise.all([
      UserModel.countDocuments({}),
      BlogModel.countDocuments({}),
      BlogModel.countDocuments({ status: 'pending_review' }),
      BlogModel.countDocuments({ status: 'approved' }),
      BlogModel.countDocuments({ status: 'rejected' }),
      BlogModel.countDocuments({ isPublished: true }),
      BlogModel.countDocuments({ status: 'draft' }),
      BlogModel.aggregate([
        { $group: { _id: null, total: { $sum: "$views" } } }
      ]),
      BlogModel.aggregate([
        { $group: { _id: null, total: { $sum: { $size: "$likes" } } } }
      ])
    ]);

    const stats = {
      totalUsers,
      totalBlogs,
      pendingReviewBlogs,
      approvedBlogs,
      rejectedBlogs,
      publishedBlogs,
      draftBlogs,
      totalViews: totalViews[0]?.total || 0,
      totalLikes: totalLikes[0]?.total || 0
    };

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

module.exports = {
  getAllUsers,
  updateUserStatus,
  getAllBlogs,
  getPendingReviewBlogs,
  moderateBlog,
  updateBlogStatus,
  getAdminStats
}; 