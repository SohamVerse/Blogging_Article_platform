const { Schema, model } = require("mongoose");

const blockSchema = new Schema({
  type: {
    type: String,
    enum: ["text", "image"],
    required: true
  },
  content: {
    type: String,
    required: true
  }
}, { _id: false });

const blogSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  content: [blockSchema],
  excerpt: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  timeToRead: {
    type: Number,
    default: 5,
    min: 1
  },
  coverImage: {
    type: String
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    default: null
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['draft', 'pending_review', 'approved', 'rejected', 'archived'],
    default: 'draft'
  },
  // Moderation fields
  moderationStatus: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedForReview: {
    type: Date,
    default: null
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  adminNotes: {
    type: String,
    trim: true
  },
  moderationFlags: [{
    type: String,
    enum: ['racism', 'communism', 'hate_speech', 'violence', 'inappropriate', 'spam', 'copyright', 'other'],
    required: true
  }],
  rejectionReason: {
    type: String,
    trim: true
  },
  contentScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, {
  timestamps: true
});

// Generate excerpt from content if not provided
blogSchema.pre('save', function(next) {
  if (!this.excerpt && this.content.length > 0) {
    const textBlocks = this.content.filter(block => block.type === 'text');
    if (textBlocks.length > 0) {
      const firstTextBlock = textBlocks[0].content;
      this.excerpt = firstTextBlock.length > 150 
        ? firstTextBlock.substring(0, 150) + '...'
        : firstTextBlock;
    }
  }
  
  // Set submittedForReview when status changes to pending_review
  if (this.status === 'pending_review' && !this.submittedForReview) {
    this.submittedForReview = new Date();
  }
  
  // Set publishedAt when approved and published
  if (this.status === 'approved' && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Index for search and filtering
blogSchema.index({ title: 'text', subtitle: 'text', tags: 'text' });
blogSchema.index({ author: 1, status: 1, moderationStatus: 1 });
blogSchema.index({ submittedForReview: -1 });
blogSchema.index({ publishedAt: -1 });
blogSchema.index({ views: -1 });
blogSchema.index({ likes: -1 });

// Virtual for like count
blogSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for read time estimation
blogSchema.virtual('estimatedReadTime').get(function() {
  if (this.timeToRead) return this.timeToRead;
  
  const textBlocks = this.content.filter(block => block.type === 'text');
  const totalWords = textBlocks.reduce((sum, block) => {
    return sum + (block.content.split(' ').length || 0);
  }, 0);
  
  // Average reading speed: 200 words per minute
  return Math.ceil(totalWords / 200);
});

// Virtual for moderation status display
blogSchema.virtual('moderationStatusDisplay').get(function() {
  const statusMap = {
    'pending': 'Pending Review',
    'under_review': 'Under Review',
    'approved': 'Approved',
    'rejected': 'Rejected'
  };
  return statusMap[this.moderationStatus] || this.moderationStatus;
});

// Ensure virtual fields are serialized
blogSchema.set('toJSON', { virtuals: true });
blogSchema.set('toObject', { virtuals: true });

const BlogModel = model("Blog", blogSchema);

module.exports = BlogModel; 