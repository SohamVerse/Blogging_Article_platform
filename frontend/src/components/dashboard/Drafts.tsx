import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Draft {
  _id: string;
  title: string;
  content: string;
  updatedAt: string;
  wordCount: number;
  tags: string[];
}

const Drafts = () => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth/login');
        return;
      }

      const response = await axios.get('https://blogging-article-platform.onrender.com/api/blogs/user/me', {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: 'draft' }
      });
      
      // Transform backend data to match our interface
      const transformedDrafts = response.data.blogs?.map((blog: any) => ({
        _id: blog._id,
        title: blog.title,
        content: blog.content?.[0]?.content || '',
        updatedAt: blog.updatedAt,
        wordCount: blog.content?.reduce((count: number, block: any) => 
          count + (block.type === 'text' ? block.content.split(' ').length : 0), 0) || 0,
        tags: blog.tags || []
      })) || [];
      
      setDrafts(transformedDrafts);
    } catch (error) {
      console.error('Error fetching drafts:', error);
      // Fallback to mock data if API fails
      setDrafts([
        {
          _id: '1',
          title: 'Advanced React Patterns',
          content: 'Exploring advanced patterns in React development...',
          updatedAt: '2024-03-20T15:30:00Z',
          wordCount: 1200,
          tags: ['react', 'patterns', 'advanced']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueWriting = () => {
    // TODO: Navigate to blog editor with draft data
    // For now, just navigate to new blog page
    navigate('/dashboard/new-blog');
  };

  const handleDelete = (draft: Draft) => {
    setSelectedDraft(draft);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedDraft) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://blogging-article-platform.onrender.com/api/blogs/${selectedDraft._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove from local state
      setDrafts(prev => prev.filter(draft => draft._id !== selectedDraft._id));
      setShowDeleteModal(false);
      setSelectedDraft(null);
    } catch (error) {
      console.error('Error deleting draft:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatWordCount = (count: number) => {
    if (count < 1000) return `${count} words`;
    return `${(count / 1000).toFixed(1)}k words`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="bg-gray-200 p-6 rounded-lg h-32 mb-4"></div>
          <div className="bg-gray-200 p-6 rounded-lg h-32 mb-4"></div>
          <div className="bg-gray-200 p-6 rounded-lg h-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Drafts</h2>

      {drafts.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow border text-center">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No drafts yet</h3>
          <p className="text-gray-600 mb-4">Start writing to create your first draft.</p>
          <button 
            onClick={() => navigate('/dashboard/new-blog')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Create New Draft
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6">
            <div className="space-y-4">
              {drafts.map((draft) => (
                <div key={draft._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{draft.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Last edited: {formatDate(draft.updatedAt)}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>📝 {formatWordCount(draft.wordCount)}</span>
                      <span>🏷️ {draft.tags.join(', ')}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleContinueWriting()}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Continue Writing
                    </button>
                    <button 
                      onClick={() => handleDelete(draft)}
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
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Delete Draft</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{selectedDraft?.title}"? This action cannot be undone.
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
                  setSelectedDraft(null);
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

export default Drafts; 