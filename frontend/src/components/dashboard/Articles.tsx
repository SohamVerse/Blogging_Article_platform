import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Article {
  _id: string;
  title: string;
  content: string;
  status: 'draft' | 'pending_review' | 'approved' | 'rejected';
  publishedAt?: string;
  updatedAt: string;
  views: number;
  tags: string[];
  moderationStatus?: string;
  rejectionReason?: string;
}

const Articles = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth/login');
        return;
      }

      const response = await axios.get('http://localhost:3000/api/blogs/user/me', {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: 'published' }
      });
      
      setArticles(response.data.blogs || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      // Fallback to mock data if API fails
      setArticles([
        {
          _id: '1',
          title: 'Getting Started with React',
          content: 'React is a JavaScript library for building user interfaces...',
          status: 'approved',
          publishedAt: '2024-03-15T10:00:00Z',
          updatedAt: '2024-03-15T10:00:00Z',
          views: 245,
          tags: ['react', 'javascript', 'frontend']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewArticle = () => {
    navigate('/dashboard/new-blog');
  };

  const handleEdit = (article: Article) => {
    // TODO: Navigate to article editor or open edit modal
    console.log('Edit article:', article);
  };

  const handleDelete = (article: Article) => {
    setSelectedArticle(article);
    setShowDeleteModal(true);
  };

  const handleSubmitForReview = async (article: Article) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:3000/api/blogs/${article._id}/submit-review`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setArticles(prev => prev.map(a => 
        a._id === article._id ? { ...a, status: 'pending_review' } : a
      ));
      
      alert('Article submitted for review successfully!');
    } catch (error) {
      console.error('Error submitting for review:', error);
      alert('Failed to submit article for review. Please try again.');
    }
  };

  const confirmDelete = async () => {
    if (!selectedArticle) return;

    try {
      // TODO: Replace with actual API call
      // await axios.delete(`/api/articles/${selectedArticle._id}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove from local state
      setArticles(prev => prev.filter(article => article._id !== selectedArticle._id));
      setShowDeleteModal(false);
      setSelectedArticle(null);
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'draft': { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      'pending_review': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Review' },
      'approved': { color: 'bg-green-100 text-green-800', label: 'Approved' },
      'rejected': { color: 'bg-red-100 text-red-800', label: 'Rejected' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="bg-gray-200 p-6 rounded-lg h-32 mb-4"></div>
          <div className="bg-gray-200 p-6 rounded-lg h-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Articles</h2>
        <button 
          onClick={handleNewArticle}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + New Article
        </button>
      </div>

      {articles.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow border text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No articles yet</h3>
          <p className="text-gray-600 mb-4">Start writing your first article to share your knowledge with the world.</p>
          <button 
            onClick={handleNewArticle}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Write Your First Article
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6">
            <div className="space-y-4">
              {articles.map((article) => (
                <div key={article._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{article.title}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(article.status)}
                      {article.status === 'rejected' && article.rejectionReason && (
                        <span className="text-xs text-red-600">({article.rejectionReason})</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {article.status === 'approved' && article.publishedAt 
                        ? `Published on ${formatDate(article.publishedAt)}`
                        : `Last updated on ${formatDate(article.updatedAt)}`
                      }
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>👁️ {article.views} views</span>
                      <span>🏷️ {article.tags.join(', ')}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {article.status === 'draft' && (
                      <>
                        <button 
                          onClick={() => handleEdit(article)}
                          className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded hover:bg-blue-50"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleSubmitForReview(article)}
                          className="text-purple-600 hover:text-purple-800 px-3 py-1 rounded hover:bg-purple-50"
                        >
                          Submit for Review
                        </button>
                      </>
                    )}
                    {article.status === 'rejected' && (
                      <>
                        <button 
                          onClick={() => handleEdit(article)}
                          className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded hover:bg-blue-50"
                        >
                          Edit & Resubmit
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => handleDelete(article)}
                      className="text-red-600 hover:text-red-800 px-3 py-1 rounded hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Delete Article</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{selectedArticle?.title}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedArticle(null);
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Articles; 