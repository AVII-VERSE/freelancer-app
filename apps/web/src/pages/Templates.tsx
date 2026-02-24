import { useEffect, useState } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Plus, Layers, Trash2, Search, Copy, FileText, Lightbulb, BookOpen, Files } from 'lucide-react';
import Layout from '../components/layout/Layout';

interface Template {
  id: string;
  name: string;
  category: string;
  strategy: string;
  content: any;
  instructions: string;
  example: string;
  purpose: string;
  fileNotes: string;
  createdAt: string;
}

export default function Templates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', category: '', strategy: '', purpose: '',
    greeting: '', opening: '', strategy_content: '',
    closing: '', regards: '', ps: '',
    instructions: '', example: '', fileNotes: '',
  });

  const fetchTemplates = async () => {
    const res = await api.get('/templates');
    setTemplates(res.data.templates);
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/templates', {
        name: form.name,
        category: form.category,
        strategy: form.strategy,
        purpose: form.purpose,
        instructions: form.instructions,
        example: form.example,
        fileNotes: form.fileNotes,
        content: {
          greeting: form.greeting,
          opening: form.opening,
          strategy: form.strategy_content,
          closing: form.closing,
          regards: form.regards,
          ps: form.ps,
        },
      });
      toast.success('Template created!');
      setShowForm(false);
      setForm({ name: '', category: '', strategy: '', purpose: '', greeting: '', opening: '', strategy_content: '', closing: '', regards: '', ps: '', instructions: '', example: '', fileNotes: '' });
      fetchTemplates();
    } catch {
      toast.error('Failed to create template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/templates/${id}`);
      toast.success('Template deleted');
      fetchTemplates();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await api.post(`/templates/${id}/duplicate`);
      toast.success('Template duplicated!');
      fetchTemplates();
    } catch {
      toast.error('Failed to duplicate');
    }
  };

  const handleCopy = (content: any) => {
    const text = Object.values(content).filter(Boolean).join('\n\n');
    navigator.clipboard.writeText(text as string);
    toast.success('Copied to clipboard!');
  };

  const filtered = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.category && t.category.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categoryColors: Record<string, string> = {
    greeting: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
    opening: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
    closing: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
    strategy: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
  };

  return (
    <Layout>
      <div className="p-8 text-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Layers size={24} className="text-blue-400" /> Templates
            </h1>
            <p className="text-gray-400 mt-1">{templates.length} saved templates</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition font-medium"
          >
            <Plus size={18} /> New Template
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-6 space-y-6">
            <h2 className="text-lg font-semibold">Create Template</h2>
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Template Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                  placeholder="My Template"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select category</option>
                  <option value="greeting">Greeting</option>
                  <option value="opening">Opening</option>
                  <option value="strategy">Strategy</option>
                  <option value="closing">Closing</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Strategy</label>
                <select
                  value={form.strategy}
                  onChange={(e) => setForm({ ...form, strategy: e.target.value })}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select strategy</option>
                  <option value="concise">Concise</option>
                  <option value="detailed">Detailed</option>
                  <option value="aggressive">Aggressive</option>
                  <option value="friendly">Friendly</option>
                </select>
              </div>
            </div>

            {/* Purpose */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                <FileText size={14} /> What is this template for? (Purpose)
              </label>
              <input
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                placeholder="e.g., Upwork proposal for web development projects"
              />
            </div>

            {/* Instructions */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                <Lightbulb size={14} /> AI Instructions (How to write the proposal)
              </label>
              <textarea
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500 h-32 resize-none"
                placeholder="Instructions for AI to follow when generating proposals using this template..."
              />
            </div>

            {/* Example */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                <BookOpen size={14} /> Example Proposal
              </label>
              <textarea
                value={form.example}
                onChange={(e) => setForm({ ...form, example: e.target.value })}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500 h-48 resize-none"
                placeholder="Write an example proposal that follows this template structure..."
              />
            </div>

            {/* File Notes */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                <FileText size={14} /> Files to Attach / Notes
              </label>
              <textarea
                value={form.fileNotes}
                onChange={(e) => setForm({ ...form, fileNotes: e.target.value })}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500 h-24 resize-none"
                placeholder="List files to attach or notes about files to include with proposals..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Greeting', key: 'greeting', placeholder: 'Hi there!' },
                { label: 'Opening', key: 'opening', placeholder: 'I came across your project...' },
                { label: 'Strategy Content', key: 'strategy_content', placeholder: 'My approach is...' },
                { label: 'Closing', key: 'closing', placeholder: 'I would love to discuss...' },
                { label: 'Regards', key: 'regards', placeholder: 'Best regards' },
                { label: 'P.S.', key: 'ps', placeholder: 'P.S. I can start immediately!' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="text-sm text-gray-400 mb-1 block">{field.label}</label>
                  <input
                    value={form[field.key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Template'}
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
              placeholder="Search templates..."
            />
          </div>
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-gray-900 text-white rounded-xl px-4 py-3 border border-gray-800 focus:outline-none focus:border-blue-500 appearance-none"
            >
              <option value="all">All Categories</option>
              <option value="greeting">Greeting</option>
              <option value="opening">Opening</option>
              <option value="strategy">Strategy</option>
              <option value="closing">Closing</option>
            </select>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.length === 0 && (
            <div className="col-span-2 text-center text-gray-500 py-16 bg-gray-900 rounded-2xl border border-gray-800">
              <Layers size={40} className="mx-auto mb-3 opacity-30" />
              <p>No templates found</p>
            </div>
          )}
          {filtered.map((template) => (
            <div key={template.id} className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
              <div
                className="p-5 cursor-pointer hover:bg-gray-800/30 transition"
                onClick={() => setExpanded(expanded === template.id ? null : template.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-white">{template.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDuplicate(template.id); }}
                      className="text-gray-500 hover:text-green-400 transition"
                      title="Duplicate template"
                    >
                      <Files size={15} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCopy(template.content); }}
                      className="text-gray-500 hover:text-blue-400 transition"
                      title="Copy content"
                    >
                      <Copy size={15} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(template.id); }}
                      className="text-gray-500 hover:text-red-400 transition"
                      title="Delete template"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  {template.category && (
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${categoryColors[template.category] || 'text-gray-400 bg-gray-400/10 border-gray-400/20'}`}>
                      {template.category}
                    </span>
                  )}
                  {template.strategy && (
                    <span className="text-xs px-2 py-0.5 rounded-full border text-cyan-400 bg-cyan-400/10 border-cyan-400/20 font-medium">
                      {template.strategy}
                    </span>
                  )}
                </div>
              </div>

              {expanded === template.id && (
                <div className="px-5 pb-5 border-t border-gray-800 pt-4 space-y-3">
                  {Object.entries(template.content).map(([key, value]) => value ? (
                    <div key={key}>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{key}</p>
                      <p className="text-gray-300 text-sm">{value as string}</p>
                    </div>
                  ) : null)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}