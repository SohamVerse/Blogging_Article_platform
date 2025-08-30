import { useState, useEffect } from 'react';
import axios from 'axios'; // Added axios import

interface BlogPost {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  author: {
    _id: string;
    username: string;
    avatar?: string;
  };
  publishedAt: string;
  readTime: number;
  likes: number;
  views: number;
  tags: string[];
  coverImage?: string;
}

const Home = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'trending'>('latest');

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    filterAndSortBlogs();
  }, [blogs, searchQuery, selectedTags, sortBy]);

  const fetchBlogs = async () => {
    try {
      // Fetch blogs from backend API
      const response = await axios.get('https://blogging-article-platform.onrender.com/api/blogs', {
        params: {
          sort: sortBy,
          limit: 20
        }
      });
      
      setBlogs(response.data.blogs || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      // Fallback to mock data if API fails
      setBlogs([
        {
          _id: '1',
          title: 'Getting Started with React Hooks',
          content: 'React Hooks have revolutionized how we write functional components...',
          excerpt: 'Learn how to use React Hooks to build modern, functional components with state and side effects.',
          author: {
            _id: 'user1',
            username: 'sarah_dev',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
          },
          publishedAt: '2024-03-15T10:00:00Z',
          readTime: 8,
          likes: 45,
          views: 1234,
          tags: ['react', 'hooks', 'frontend', 'javascript'],
          coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop'
        },
        {
          _id: '2',
          title: 'TypeScript Best Practices for 2024',
          content: 'TypeScript continues to evolve with new features and best practices...',
          excerpt: 'Discover the latest TypeScript best practices and patterns for building robust applications.',
          author: {
            _id: 'user2',
            username: 'mike_coder',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
          },
          publishedAt: '2024-03-14T14:30:00Z',
          readTime: 12,
          likes: 67,
          views: 2156,
          tags: ['typescript', 'best-practices', 'javascript', 'development'],
          coverImage: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=200&fit=crop'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortBlogs = () => {
    let filtered = [...blogs];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(blog => 
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(blog =>
        selectedTags.some(tag => blog.tags.includes(tag))
      );
    }

    // Sort blogs
    switch (sortBy) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'trending':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
    }

    setFilteredBlogs(filtered);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleLike = async (blogId: string) => {
    try {
      // TODO: Replace with actual API call
      // await axios.post(`/api/blogs/${blogId}/like`);
      
      // Update local state
      setBlogs(prev => prev.map(blog => 
        blog._id === blogId 
          ? { ...blog, likes: blog.likes + 1 }
          : blog
      ));
    } catch (error) {
      console.error('Error liking blog:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const allTags = Array.from(new Set(blogs.flatMap(blog => blog.tags)));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-80"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Discover Blogs</h2>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search blogs by title, content, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <div className="flex space-x-2">
              {[
                { value: 'latest', label: 'Latest' },
                { value: 'popular', label: 'Most Popular' },
                { value: 'trending', label: 'Trending' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as any)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    sortBy === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags Filter */}
          <div>
            <span className="text-sm font-medium text-gray-700 mb-2 block">Filter by tags:</span>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Blog Grid */}
      {filteredBlogs.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow border text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No blogs found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <div key={blog._id} className="bg-white rounded-lg shadow border overflow-hidden hover:shadow-lg transition-shadow">
              {/* Cover Image */}
              {blog.coverImage && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={blog.coverImage} 
                    alt={blog.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                {/* Author Info */}
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    {blog.author.avatar ? (
                      <img src={blog.author.avatar} alt={blog.author.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm">
                        {blog.author.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">@{blog.author.username}</p>
                    <p className="text-xs text-gray-500">{formatDate(blog.publishedAt)}</p>
                  </div>
                </div>

                {/* Blog Title and Excerpt */}
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{blog.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{blog.excerpt}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {blog.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      #{tag}
                    </span>
                  ))}
                  {blog.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{blog.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* Stats and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>👁️ {blog.views}</span>
                    <span>❤️ {blog.likes}</span>
                    <span>⏱️ {blog.readTime} min</span>
                  </div>
                  <button
                    onClick={() => handleLike(blog._id)}
                    className="text-red-500 hover:text-red-600 transition-colors"
                  >
                    ❤️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home; 