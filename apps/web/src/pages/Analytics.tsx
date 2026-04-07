import { useEffect, useState } from 'react';
import api from '../lib/api';
import { BarChart3, TrendingUp, DollarSign, Clock, Trophy, Target, FileText, Calendar } from 'lucide-react';
import Layout from '../components/layout/Layout';

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

export default function Analytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/records/analytics')
      .then(res => setAnalytics(res.data.analytics))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  const winRateNum = analytics ? parseFloat(analytics.winRate) : 0;
  const lossRateNum = 100 - winRateNum;

  const stats = [
    { label: 'Total Proposals', value: analytics?.totalProposals || 0, icon: FileText, color: '#60a5fa', bg: 'bg-blue-500/10' },
    { label: 'Won Projects', value: analytics?.wonProposals || 0, icon: Trophy, color: '#34d399', bg: 'bg-green-500/10' },
    { label: 'Pending', value: analytics?.pendingProposals || 0, icon: Clock, color: '#fbbf24', bg: 'bg-yellow-500/10' },
    { label: 'Lost', value: analytics?.lostProposals || 0, icon: Target, color: '#f87171', bg: 'bg-red-500/10' },
    { label: 'Win Rate', value: analytics?.winRate || '0%', icon: TrendingUp, color: '#a78bfa', bg: 'bg-purple-500/10' },
    { label: 'Total Earnings', value: `$${analytics?.totalEarnings || 0}`, icon: DollarSign, color: '#34d399', bg: 'bg-green-500/10' },
  ];

  const techData = analytics
    ? Object.entries(analytics.techStackUsage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, value]) => ({ name, value }))
    : [];

  return (
    <Layout>
      <div className="p-8 text-white">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <BarChart3 size={24} className="text-blue-400" /> Analytics
          </h1>
          <p className="text-gray-400 mt-1">Track your performance and improve your win rate</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Win/Loss Ratio */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Win/Loss Ratio</h2>
            <div className="relative pt-8">
              <div className="flex h-6 rounded-full overflow-hidden bg-gray-800">
                <div 
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${winRateNum}%` }}
                />
                <div 
                  className="h-full bg-red-500 transition-all"
                  style={{ width: `${lossRateNum}%` }}
                />
              </div>
              <div className="flex justify-between mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-400">Won ({winRateNum}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-gray-400">Lost ({lossRateNum}%)</span>
                </div>
              </div>
            </div>

            {/* Performance Tips */}
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800/40 rounded-xl">
              <h3 className="text-blue-400 font-semibold mb-2">Performance Tips</h3>
              {winRateNum >= 50 ? (
                <p className="text-sm text-gray-300">Great job! Your win rate is above 50%. Keep analyzing your successful proposals to replicate what works.</p>
              ) : (
                <p className="text-sm text-gray-300">Your win rate needs improvement. Consider: better proposal customization, faster response times, and stronger opening statements.</p>
              )}
            </div>
          </div>

          {/* Tech Stack Usage */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Top Technologies Used</h2>
            {techData.length > 0 ? (
              <div className="space-y-4">
                {techData.map((tech, index) => {
                  const maxValue = Math.max(...techData.map(t => t.value));
                  const percentage = (tech.value / maxValue) * 100;
                  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
                  return (
                    <div key={tech.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">{tech.name}</span>
                        <span className="text-gray-400">{tech.value} projects</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ width: `${percentage}%`, backgroundColor: colors[index % colors.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <BarChart3 size={40} className="mx-auto mb-2 opacity-30" />
                <p>No tech stack data yet</p>
                <p className="text-sm">Add project records to see analytics</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="mt-6 bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-blue-400" /> Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Success Rate</p>
              <p className="text-2xl font-bold text-white mt-1">{analytics?.successRate || '0%'}</p>
              <p className="text-xs text-gray-500 mt-1">of all proposals</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Avg. Bid Value</p>
              <p className="text-2xl font-bold text-white mt-1">
                ${analytics?.wonProposals ? Math.round(analytics.totalEarnings / analytics.wonProposals) : 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">per won project</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Templates</p>
              <p className="text-2xl font-bold text-white mt-1">{analytics?.totalTemplates || 0}</p>
              <p className="text-xs text-gray-500 mt-1">saved templates</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Active</p>
              <p className="text-2xl font-bold text-white mt-1">{analytics?.pendingProposals || 0}</p>
              <p className="text-xs text-gray-500 mt-1">pending proposals</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
