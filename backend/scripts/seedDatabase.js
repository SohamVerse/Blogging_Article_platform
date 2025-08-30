const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const UserModel = require('../models/userModel');
const BlogModel = require('../models/blogModel');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_DB);
    console.log('Connected to MongoDB');

    // Clear existing data
    await UserModel.deleteMany({});
    await BlogModel.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new UserModel({
      username: 'admin',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
      isActive: true,
      bio: 'Platform administrator with full system access',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      preferences: {
        emailNotifications: true,
        newsletter: false,
        privacyLevel: 'public'
      }
    });
    await adminUser.save();
    console.log('Created admin user');

    // Create regular users
    const users = [];
    const userData = [
      {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'password123',
        bio: 'Full-stack developer passionate about React and Node.js',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      },
      {
        username: 'jane_smith',
        email: 'jane@example.com',
        password: 'password123',
        bio: 'UI/UX designer creating beautiful user experiences',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
      },
      {
        username: 'mike_coder',
        email: 'mike@example.com',
        password: 'password123',
        bio: 'Backend developer specializing in scalable architectures',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      },
      {
        username: 'sarah_dev',
        email: 'sarah@example.com',
        password: 'password123',
        bio: 'Frontend developer and open source contributor',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
      }
    ];

    for (const userInfo of userData) {
      const hashedPassword = await bcrypt.hash(userInfo.password, 10);
      const user = new UserModel({
        username: userInfo.username,
        email: userInfo.email,
        password: hashedPassword,
        role: 'user',
        isActive: true,
        bio: userInfo.bio,
        avatar: userInfo.avatar,
        preferences: {
          emailNotifications: true,
          newsletter: Math.random() > 0.5,
          privacyLevel: ['public', 'private', 'friends'][Math.floor(Math.random() * 3)]
        }
      });
      await user.save();
      users.push(user);
      console.log(`Created user: ${userInfo.username}`);
    }

    // Create demo blogs
    const blogData = [
      {
        title: 'Getting Started with React Hooks',
        subtitle: 'Learn the fundamentals of React Hooks and modern functional components',
        content: [
          { type: 'text', content: 'React Hooks have revolutionized how we write functional components. They allow us to use state and other React features without writing class components.' },
          { type: 'text', content: 'In this comprehensive guide, we\'ll explore useState, useEffect, useContext, and custom hooks. You\'ll learn how to build modern, efficient React applications.' }
        ],
        tags: ['react', 'hooks', 'frontend', 'javascript'],
        timeToRead: 8,
        coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop',
        author: users[0]._id,
        status: 'approved',
        moderationStatus: 'approved',
        isPublished: true,
        publishedAt: new Date('2024-03-15T10:00:00Z'),
        submittedForReview: new Date('2024-03-14T10:00:00Z'),
        reviewedBy: adminUser._id,
        reviewedAt: new Date('2024-03-15T10:00:00Z'),
        views: 245,
        likes: [users[1]._id, users[2]._id, users[3]._id],
        contentScore: 85
      },
      {
        title: 'TypeScript Best Practices for 2024',
        subtitle: 'Discover the latest TypeScript patterns and best practices',
        content: [
          { type: 'text', content: 'TypeScript continues to evolve with new features and best practices. This guide covers advanced types, utility types, and modern patterns.' },
          { type: 'text', content: 'We\'ll explore generics, conditional types, mapped types, and how to use them effectively in your projects.' }
        ],
        tags: ['typescript', 'best-practices', 'javascript', 'development'],
        timeToRead: 12,
        coverImage: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=200&fit=crop',
        author: users[1]._id,
        status: 'approved',
        moderationStatus: 'approved',
        isPublished: true,
        publishedAt: new Date('2024-03-14T14:30:00Z'),
        submittedForReview: new Date('2024-03-13T14:30:00Z'),
        reviewedBy: adminUser._id,
        reviewedAt: new Date('2024-03-14T14:30:00Z'),
        views: 189,
        likes: [users[0]._id, users[2]._id],
        contentScore: 92
      },
      {
        title: 'Building Scalable APIs with Node.js',
        subtitle: 'Learn how to create robust and maintainable REST APIs',
        content: [
          { type: 'text', content: 'Creating scalable and maintainable APIs requires careful architecture. This guide covers Express.js, middleware patterns, and database design.' },
          { type: 'text', content: 'We\'ll explore authentication, validation, error handling, and testing strategies for production-ready APIs.' }
        ],
        tags: ['nodejs', 'api', 'backend', 'express', 'scalability'],
        timeToRead: 15,
        coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop',
        author: users[2]._id,
        status: 'pending_review',
        moderationStatus: 'pending',
        isPublished: false,
        submittedForReview: new Date('2024-03-20T09:15:00Z'),
        views: 0,
        likes: [],
        contentScore: 0
      },
      {
        title: 'CSS Grid vs Flexbox: When to Use What',
        subtitle: 'A comprehensive guide to modern CSS layout techniques',
        content: [
          { type: 'text', content: 'Understanding when to use CSS Grid vs Flexbox can make your layouts much more efficient. This guide helps you choose the right tool for each job.' },
          { type: 'text', content: 'We\'ll explore practical examples and real-world use cases for both layout systems.' }
        ],
        tags: ['css', 'grid', 'flexbox', 'frontend', 'design'],
        timeToRead: 10,
        coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop',
        author: users[3]._id,
        status: 'rejected',
        moderationStatus: 'rejected',
        isPublished: false,
        submittedForReview: new Date('2024-03-18T16:45:00Z'),
        reviewedBy: adminUser._id,
        reviewedAt: new Date('2024-03-19T10:00:00Z'),
        views: 0,
        likes: [],
        moderationFlags: ['inappropriate'],
        rejectionReason: 'Content contains inappropriate language',
        contentScore: 45
      },
      {
        title: 'Introduction to MongoDB and Mongoose',
        subtitle: 'Getting started with NoSQL databases in Node.js',
        content: [
          { type: 'text', content: 'MongoDB is a powerful NoSQL database that works great with Node.js. This guide covers the basics of MongoDB and how to use Mongoose ODM.' },
          { type: 'text', content: 'We\'ll explore schemas, models, queries, and best practices for building robust applications.' }
        ],
        tags: ['mongodb', 'mongoose', 'database', 'nodejs', 'nosql'],
        timeToRead: 14,
        coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=200&fit=crop',
        author: users[0]._id,
        status: 'draft',
        moderationStatus: 'pending',
        isPublished: false,
        views: 0,
        likes: [],
        contentScore: 0
      }
    ];

    for (const blogInfo of blogData) {
      const blog = new BlogModel(blogInfo);
      await blog.save();
      console.log(`Created blog: ${blogInfo.title}`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log(`📊 Created ${users.length + 1} users (including admin)`);
    console.log(`📝 Created ${blogData.length} blogs`);
    console.log('\n🔑 Admin credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('\n👥 Regular user credentials:');
    console.log('   Username: john_doe (or any other user)');
    console.log('   Password: password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function
seedDatabase(); 