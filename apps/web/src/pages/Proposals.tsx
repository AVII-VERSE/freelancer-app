import { useEffect, useState } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Plus, FileText, Trash2, Search, Filter, Copy } from 'lucide-react';
import Layout from '../components/layout/Layout';

interface Proposal {
  id: string;
  title: string;
  content: string;
  status: string;
  bidAmount: number;
  createdAt: string;
}

const statusColor: Record<string, string> = {
  pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  won: 'text-green-400 bg-green-400/10 border-green-400/20',
  lost: 'text-red-400 bg-red-400/10 border-red-400/20',
  no_response: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
};

export default function Proposals() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [filtered, setFiltered] = useState<Proposal[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchProposals = async () => {
    const params = new URLSearchParams();
    if (statusFilter !== 'all') {
      params.append('status', statusFilter);
    }
    if (search) {
      params.append('search', search);
    }
    const queryString = params.toString();
    const res = await api.get(`/proposals${queryString ? `?${queryString}` : ''}`);
    setProposals(res.data.proposals);
    setFiltered(res.data.proposals);
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  useEffect(() => {
    let result = proposals;
    if (search) {
      result = result.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
    }
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }
    setFiltered(result);
  }, [search, statusFilter, proposals]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/proposals', { title, content, bidAmount: Number(bidAmount) });
      toast.success('Proposal created!');
      setTitle(''); setContent(''); setBidAmount('');
      setShowForm(false);
      fetchProposals();
    } catch {
      toast.error('Failed to create proposal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/proposals/${id}`);
      toast.success('Proposal deleted');
      fetchProposals();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleClone = async (id: string) => {
    try {
      await api.post(`/proposals/${id}/clone`);
      toast.success('Proposal cloned!');
      fetchProposals();
    } catch {
      toast.error('Failed to clone');
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.put(`/proposals/${id}/status`, { status });
      toast.success('Status updated!');
      fetchProposals();
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <Layout>
      <div className="p-8 text-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText size={24} className="text-blue-400" /> Proposals
            </h1>
            <p className="text-gray-400 mt-1">{proposals.length} total proposals</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition font-medium"
          >
            <Plus size={18} /> New Proposal
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Create New Proposal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Project Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                  placeholder="React Dashboard Project"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Bid Amount ($)</label>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                  placeholder="500"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Proposal Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500 h-48 resize-none"
                placeholder="Write your proposal here..."
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Proposal'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold px-6 py-3 rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Search & Filter */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-900 text-white rounded-xl pl-10 pr-4 py-3 border border-gray-800 focus:outline-none focus:border-blue-500"
              placeholder="Search proposals..."
            />
          </div>
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-900 text-white rounded-xl pl-10 pr-4 py-3 border border-gray-800 focus:outline-none focus:border-blue-500 appearance-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
              <option value="no_response">No Response</option>
            </select>
          </div>
        </div>

        {/* Proposals List */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center text-gray-500 py-16 bg-gray-900 rounded-2xl border border-gray-800">
              <FileText size={40} className="mx-auto mb-3 opacity-30" />
              <p>No proposals found</p>
            </div>
          )}
          {filtered.map((proposal) => (
            <div key={proposal.id} className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
              <div
                className="p-5 cursor-pointer hover:bg-gray-800/30 transition"
                onClick={() => setExpanded(expanded === proposal.id ? null : proposal.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-white">{proposal.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${statusColor[proposal.status]}`}>
                        {proposal.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-1">{proposal.content}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    {proposal.bidAmount && (
                      <span className="text-blue-400 font-semibold">${proposal.bidAmount}</span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleClone(proposal.id); }}
                      className="text-gray-600 hover:text-blue-400 transition"
                      title="Clone proposal"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(proposal.id); }}
                      className="text-gray-600 hover:text-red-400 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {expanded === proposal.id && (
                <div className="px-5 pb-5 border-t border-gray-800 pt-4">
                  <p className="text-gray-300 text-sm whitespace-pre-wrap mb-4">{proposal.content}</p>
                  <div className="flex gap-2">
                    {['pending', 'won', 'lost', 'no_response'].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusUpdate(proposal.id, s)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium capitalize transition ${
                          proposal.status === s
                            ? statusColor[s]
                            : 'border-gray-700 text-gray-500 hover:border-gray-600'
                        }`}
                      >
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}