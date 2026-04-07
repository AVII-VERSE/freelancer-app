import { useEffect, useState } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Plus, Folder, Trash2, Search, DollarSign, Globe, Code, Loader2, Edit2 } from 'lucide-react';
import Layout from '../components/layout/Layout';

interface ProjectRecord {
  id: string;
  title: string;
  description: string;
  clientCountry: string;
  timezone: string;
  techStack: string[];
  bidAmount: number;
  status: string;
  createdAt: string;
  proposal?: {
    title: string;
    status: string;
  };
}

export default function Projects() {
  const [records, setRecords] = useState<ProjectRecord[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState<ProjectRecord[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    proposalId: '',
    title: '',
    description: '',
    clientCountry: '',
    timezone: '',
    techStack: '',
    bidAmount: '',
  });

  const fetchData = async () => {
    try {
      const [recordsRes, proposalsRes] = await Promise.all([
        api.get('/records'),
        api.get('/proposals?status=won'),
      ]);
      setRecords(recordsRes.data.records);
      setFiltered(recordsRes.data.records);
      setProposals(proposalsRes.data.proposals);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const result = records.filter(r =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.clientCountry?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, records]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingId) {
        await api.put(`/records/${editingId}`, {
          title: form.title,
          description: form.description,
          clientCountry: form.clientCountry,
          timezone: form.timezone,
          techStack: form.techStack.split(',').map(s => s.trim()).filter(Boolean),
          bidAmount: form.bidAmount ? parseFloat(form.bidAmount) : undefined,
        });
        toast.success('Project updated!');
        setEditingId(null);
      } else {
        await api.post('/records', {
          proposalId: form.proposalId || undefined,
          title: form.title,
          description: form.description,
          clientCountry: form.clientCountry,
          timezone: form.timezone,
          techStack: form.techStack.split(',').map(s => s.trim()).filter(Boolean),
          bidAmount: form.bidAmount ? parseFloat(form.bidAmount) : undefined,
        });
        toast.success('Project added!');
      }
      setShowForm(false);
      setForm({ proposalId: '', title: '', description: '', clientCountry: '', timezone: '', techStack: '', bidAmount: '' });
      fetchData();
    } catch {
      toast.error(editingId ? 'Failed to update project' : 'Failed to add project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (record: ProjectRecord) => {
    setEditingId(record.id);
    setForm({
      proposalId: '',
      title: record.title,
      description: record.description || '',
      clientCountry: record.clientCountry || '',
      timezone: record.timezone || '',
      techStack: record.techStack?.join(', ') || '',
      bidAmount: record.bidAmount?.toString() || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/records/${id}`);
      toast.success('Project deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const totalEarnings = records.reduce((sum, r) => sum + (r.bidAmount || 0), 0);

  return (
    <Layout>
      <div className="p-8 text-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3 text-white">
              <Folder size={24} className="text-blue-500" /> Projects
            </h1>
            <p className="mt-1 text-gray-400">{records.length} projects - ${totalEarnings.toLocaleString()} total earnings</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-5 py-2.5 rounded-xl flex items-center gap-2 transition font-medium text-white bg-blue-500 hover:bg-blue-600"
          >
            <Plus size={18} /> Add Project
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="rounded-2xl p-6 mb-6 space-y-4 bg-gray-800 border border-gray-700">
            <h2 className="text-lg font-semibold text-white">{editingId ? 'Edit Project' : 'Add New Project'}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm mb-1 block text-gray-400">Link to Won Proposal (optional)</label>
                <select
                  value={form.proposalId}
                  onChange={(e) => {
                    const proposal = proposals.find(p => p.id === e.target.value);
                    setForm({ 
                      ...form, 
                      proposalId: e.target.value,
                      title: proposal ? proposal.title : form.title,
                    });
                  }}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select a won proposal</option>
                  {proposals.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Project Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                  placeholder="E-commerce Website"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500 h-24 resize-none"
                placeholder="Project details..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block flex items-center gap-1">
                  <Globe size={14} /> Client Country
                </label>
                <input
                  value={form.clientCountry}
                  onChange={(e) => setForm({ ...form, clientCountry: e.target.value })}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                  placeholder="USA, UK..."
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Timezone</label>
                <input
                  value={form.timezone}
                  onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                  placeholder="America/New_York"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block flex items-center gap-1">
                  <DollarSign size={14} /> Amount ($)
                </label>
                <input
                  type="number"
                  value={form.bidAmount}
                  onChange={(e) => setForm({ ...form, bidAmount: e.target.value })}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                  placeholder="1000"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block flex items-center gap-1">
                <Code size={14} /> Tech Stack
              </label>
              <input
                value={form.techStack}
                onChange={(e) => setForm({ ...form, techStack: e.target.value })}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                placeholder="React, Node.js, MongoDB"
              />
              <p className="text-xs text-gray-500 mt-1">Separate technologies with commas</p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                {isLoading ? 'Adding...' : 'Add Project'}
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

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 text-white rounded-xl pl-10 pr-4 py-3 border border-gray-800 focus:outline-none focus:border-blue-500"
            placeholder="Search projects..."
          />
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-16 bg-gray-900 rounded-2xl border border-gray-800">
              <Folder size={40} className="mx-auto mb-3 opacity-30" />
              <p>No projects found</p>
            </div>
          )}
          {filtered.map((record) => (
            <div key={record.id} className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-white">{record.title}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(record)}
                    className="text-gray-500 hover:text-blue-400 transition"
                    title="Edit project"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="text-gray-500 hover:text-red-400 transition"
                    title="Delete project"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              
              {record.description && (
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{record.description}</p>
              )}

              <div className="flex flex-wrap gap-2 mb-3">
                {record.techStack?.map((tech, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-full bg-blue-400/10 text-blue-400 border border-blue-400/20">
                    {tech}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Globe size={12} />
                  <span>{record.clientCountry || 'N/A'}</span>
                </div>
                {record.bidAmount && (
                  <span className="text-green-400 font-semibold">${record.bidAmount.toLocaleString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
