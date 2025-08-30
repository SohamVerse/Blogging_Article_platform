import { useState, useEffect } from 'react';

interface DashboardStats {
  totalArticles: number;
  drafts: number;
  views: number;
}

interface Activity {
  id: string;
  type: 'published' | 'saved' | 'edited';
  message: string;
  timestamp: string;
}

const Overview = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalArticles: 0,
    drafts: 0,
    views: 0
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchDashboardData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - replace with actual API response
        setStats({
          totalArticles: 12,
          drafts: 3,
          views: 1247
        });
        
        setActivities([
          {
            id: '1',
            type: 'published',
            message: 'Article "Getting Started with React" published',
            timestamp: '2 hours ago'
          },
          {
            id: '2',
            type: 'saved',
            message: 'Draft "Advanced TypeScript" saved',
            timestamp: '1 day ago'
          }
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 p-6 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Articles</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalArticles}</p>
          <p className="text-sm text-gray-600">Published articles</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Drafts</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.drafts}</p>
          <p className="text-sm text-gray-600">Work in progress</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Views</h3>
          <p className="text-3xl font-bold text-green-600">{stats.views.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Total article views</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'published' ? 'bg-green-500' : 
                activity.type === 'saved' ? 'bg-blue-500' : 'bg-yellow-500'
              }`}></div>
              <span className="text-sm text-gray-600">{activity.message}</span>
              <span className="text-xs text-gray-400">{activity.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview; 