import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Home from '../components/dashboard/Home';
import Overview from '../components/dashboard/Overview';
import Profile from '../components/dashboard/Profile';
import Articles from '../components/dashboard/Articles';
import Drafts from '../components/dashboard/Drafts';
import Settings from '../components/dashboard/Settings';

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  bio: string;
  avatar: string;
  preferences: {
    emailNotifications: boolean;
    newsletter: boolean;
    privacyLevel: string;
  };
}

type DashboardPage = 'home' | 'overview' | 'profile' | 'articles' | 'drafts' | 'settings';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState<DashboardPage>('home');

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (!token || !userData) {
        navigate('/auth/login');
        return;
      }

      try {
        // Verify token with backend
        const response = await axios.get('http://localhost:3000/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUser(response.data.user);
      } catch (error) {
        console.error('Auth verification failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
    navigate('/auth/login');
  };

  const sidebarItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'articles', label: 'My Articles', icon: '📝' },
    { id: 'drafts', label: 'Drafts', icon: '📄' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const renderContent = () => {
    switch (activePage) {
      case 'home': return <Home />;
      case 'overview': return <Overview />;
      case 'profile': return <Profile />;
      case 'articles': return <Articles />;
      case 'drafts': return <Drafts />;
      case 'settings': return <Settings />;
      default: return <div>Page not found</div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar-like header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.username}!</span>
              {user?.role === 'admin' && (
                <button 
                  onClick={() => navigate('/admin')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Admin Panel
                </button>
              )}
              <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id as DashboardPage)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                    activePage === item.id ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-600' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
        {/* Main Content */}
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
