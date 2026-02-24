import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Bot, Clock, FileText, Plus, TrendingUp, Trophy, Zap, DollarSign } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useAuthStore } from '../store/auth.store';
import api from '../lib/api';

interface Analytics {
  totalProposals: number;
  wonProposals: number;
  lostProposals: number;
  pendingProposals: number;
  successRate: string;
  winRate: string;
  totalEarnings: number;
  totalTemplates: number;
  techStackUsage: Record<string, number>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    api.get('/records/analytics')
      .then((res) => setAnalytics(res.data.analytics))
      .catch(() => {});
  }, []);

  const pieData = analytics
    ? [
        { name: 'Won', value: analytics.wonProposals },
        { name: 'Pending', value: analytics.pendingProposals },
        { name: 'Lost', value: analytics.lostProposals },
      ].filter((d) => d.value > 0)
    : [];

  const techData = analytics
    ? Object.entries(analytics.techStackUsage).map(([name, value]) => ({ name, value }))
    : [];

  const areaData = [
    { day: 'Mon', proposals: 2 },
    { day: 'Tue', proposals: 4 },
    { day: 'Wed', proposals: 3 },
    { day: 'Thu', proposals: 6 },
    { day: 'Fri', proposals: 5 },
    { day: 'Sat', proposals: 8 },
    { day: 'Sun', proposals: 4 },
  ];

  const stats = [
    { label: 'Total Proposals', value: analytics?.totalProposals || 0, icon: FileText, color: '#60a5fa' },
    { label: 'Won Projects', value: analytics?.wonProposals || 0, icon: Trophy, color: '#34d399' },
    { label: 'Pending', value: analytics?.pendingProposals || 0, icon: Clock, color: '#fbbf24' },
    { label: 'Win Rate', value: analytics?.winRate || '0%', icon: TrendingUp, color: '#a78bfa' },
    { label: 'Total Earnings', value: `$${analytics?.totalEarnings || 0}`, icon: DollarSign, color: '#34d399' },
  ];

  const quickActions = [
    { label: 'New Proposal', icon: Plus, color: 'bg-blue-600 hover:bg-blue-700', path: '/proposals' },
    { label: 'AI Analysis', icon: Bot, color: 'bg-green-600 hover:bg-green-700', path: '/ai' },
    { label: 'Analytics', icon: TrendingUp, color: 'bg-violet-600 hover:bg-violet-700', path: '/analytics' },
    { label: 'Templates', icon: Zap, color: 'bg-cyan-600 hover:bg-cyan-700', path: '/templates' },
  ];

  return (
    <Layout>
      <div className="min-h-screen p-8 text-white">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Good day, {user?.name || 'Freelancer'}</h1>
            <p className="mt-1 text-sm text-gray-400">Here is your freelance performance overview</p>
          </div>
          <Link
            to="/proposals"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
          >
            <Plus size={18} /> New Proposal
          </Link>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-400">{stat.label}</p>
                <div className="rounded-lg bg-gray-800 p-2">
                  <stat.icon size={16} style={{ color: stat.color }} />
                </div>
              </div>
              <p className="text-3xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-semibold text-white">Proposal Activity</h2>
              <span className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-400">This Week</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="colorProposals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#6b7280" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Area type="monotone" dataKey="proposals" stroke="#3b82f6" fill="url(#colorProposals)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <h2 className="mb-4 font-semibold text-white">Proposal Status</h2>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-2">
                  {pieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                        <span className="text-gray-400">{entry.name}</span>
                      </div>
                      <span className="font-medium text-white">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-gray-400">
                <Trophy size={32} className="opacity-20" />
                <p>No proposal data yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <h2 className="mb-4 font-semibold text-white">Tech Stack Usage</h2>
            {techData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={techData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                  <XAxis type="number" stroke="#6b7280" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#6b7280"
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {techData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-gray-400">
                <FileText size={32} className="opacity-20" />
                <p>No tech stack data yet</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <h2 className="mb-4 font-semibold text-white">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.path}
                  className={`rounded-xl p-4 text-center font-medium text-white transition ${action.color}`}
                >
                  <action.icon size={22} className="mx-auto mb-2" />
                  <span className="text-sm">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
