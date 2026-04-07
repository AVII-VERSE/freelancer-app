import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useEffect, useState } from 'react';
import api from '../../lib/api';
import {
  LayoutDashboard, Folder, Users, Search, FileText, Layers, Bot, BarChart3, Clock, LogOut, Zap, User,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/projects', icon: Folder, label: 'Projects' },
  { path: '/clients', icon: Users, label: 'Clients' },
  { path: '/project-search', icon: Search, label: 'Project Search' },
  { path: '/proposals', icon: FileText, label: 'Proposals' },
  { path: '/templates', icon: Layers, label: 'Templates' },
  { path: '/ai', icon: Bot, label: 'AI Analysis' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/timezone', icon: Clock, label: 'Timezone Alerts' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [completion, setCompletion] = useState<{ percentage: number } | null>(null);

  useEffect(() => {
    api.get('/profile/completion')
      .then((res) => setCompletion(res.data.profileCompletion))
      .catch(() => {});
  }, []);

  return (
    <div className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-gray-800 bg-gray-950">

      {/* Logo */}
      <div className="border-b border-gray-800 p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl p-2" style={{ backgroundColor: '#FF9B51' }}>
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none text-white">
              FreelanceApp
            </h1>
            <p className="mt-0.5 text-xs text-gray-500">Power User Tool</p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
              style={{
                backgroundColor: isActive ? 'rgba(255, 155, 81, 0.16)' : 'transparent',
                border: isActive ? '1px solid rgba(255, 155, 81, 0.5)' : '1px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(191, 201, 209, 0.12)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              }}
            >
              <item.icon
                size={18}
                style={{ color: isActive ? '#FF9B51' : '#BFC9D1' }}
              />
              <span
                className="font-medium text-sm"
                style={{ color: isActive ? '#EAEFEF' : '#BFC9D1' }}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#FF9B51' }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-gray-800 p-4">
        {completion && completion.percentage < 100 && (
          <Link to="/profile" className="block mb-3 p-2 rounded-lg transition cursor-pointer" style={{ backgroundColor: 'rgba(255, 155, 81, 0.14)', border: '1px solid rgba(255, 155, 81, 0.34)' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs" style={{ color: '#FF9B51' }}>Profile {completion.percentage}% complete</span>
              <span className="text-xs" style={{ color: '#FF9B51' }}>{completion.percentage}%</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all"
                style={{ backgroundColor: '#FF9B51', width: `${completion.percentage}%` }}
              />
            </div>
          </Link>
        )}
        <div className="flex items-center gap-3 rounded-xl bg-gray-900 px-4 py-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: '#FF9B51', color: '#25343F' }}
          >
            {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.name || 'User'}</p>
            <p className="truncate text-xs text-gray-500">{user?.email}</p>
          </div>
          <button onClick={logout} style={{ color: '#BFC9D1' }}
            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = '#FF9B51'}
            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = '#BFC9D1'}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
