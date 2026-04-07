import { useState, useEffect } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Plus, Copy, Trash2, Edit2, Save, X, Loader2, FileText } from 'lucide-react';
import Layout from '../components/layout/Layout';

interface QuickTemplate {
  id: string;
  name: string;
  content: string;
  category: 'greeting' | 'introduction' | 'closing' | 'other';
  createdAt: string;
}

const defaultTemplates: Omit<QuickTemplate, 'id' | 'createdAt'>[] = [
  { name: 'Formal Greeting', content: 'Dear Hiring Manager,\n\nThank you for considering my proposal. I am very interested in this project and believe I am the perfect fit for your needs.', category: 'greeting' },
  { name: 'Friendly Greeting', content: 'Hi there!\n\nThanks for checking out my proposal! I am excited about the opportunity to work with you.', category: 'greeting' },
  { name: 'Quick Intro', content: 'I am a experienced freelancer with expertise in [SKILLS]. I have completed similar projects successfully.', category: 'introduction' },
  { name: 'Detailed Intro', content: 'With over [YEARS] years of experience in [FIELD], I have worked with [PREVIOUS CLIENTS]. My approach focuses on delivering quality work on time.', category: 'introduction' },
  { name: 'Professional Closing', content: 'Thank you for your time and consideration. I look forward to hearing from you and discussing the project further.\n\nBest regards,\n[YOUR NAME]', category: 'closing' },
  { name: 'Friendly Closing', content: 'Looking forward to working with you! Feel free to reach out if you have any questions.\n\nBest,\n[YOUR NAME]', category: 'closing' },
];

const categories = [
  { key: 'greeting', label: 'Greetings' },
  { key: 'introduction', label: 'Introductions' },
  { key: 'closing', label: 'Closings' },
  { key: 'other', label: 'Other' },
];

export default function QuickTemplates() {
  const [templates, setTemplates] = useState<QuickTemplate[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', content: '', category: 'other' as string });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const fetchTemplates = async () => {
    setIsFetching(true);
    try {
      const res = await api.get('/quick-templates');
      setTemplates(res.data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.content.trim()) {
      toast.error('Name and content are required');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/quick-templates/${editingId}`, form);
        toast.success('Template updated!');
      } else {
        await api.post('/quick-templates', form);
        toast.success('Template created!');
      }
      setForm({ name: '', content: '', category: 'other' });
      setShowForm(false);
      setEditingId(null);
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/quick-templates/${id}`);
      toast.success('Deleted!');
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content)
      .then(() => {
        setCopiedId(id);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch(() => {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = content;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopiedId(id);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopiedId(null), 2000);
      });
  };

  const handleEdit = (template: QuickTemplate) => {
    setForm({ name: template.name, content: template.content, category: template.category });
    setEditingId(template.id);
    setShowForm(true);
  };

  const addDefaultTemplate = async (template: Omit<QuickTemplate, 'id' | 'createdAt'>) => {
    try {
      await api.post('/quick-templates', template);
      toast.success('Added!');
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to add');
    }
  };

  return (
    <Layout>
      <div className="p-8 text-white">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText size={24} className="text-blue-400" /> Quick Templates
            </h1>
            <p className="text-gray-400 mt-1">{templates.length} saved templates</p>
          </div>
          <button
            onClick={() => { setForm({ name: '', content: '', category: 'other' }); setEditingId(null); setShowForm(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition font-medium"
          >
            <Plus size={18} /> Add Template
          </button>
        </div>
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setFilter(cat.key)}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                filter === cat.key ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Templates List */}
        {isFetching ? (
          <div className="flex items-center justify-center py-16 bg-gray-900 rounded-2xl border border-gray-800">
            <Loader2 size={32} className="animate-spin text-blue-400" />
          </div>
        ) : (
          <>
            {/* Add Default Templates */}
            <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 mb-6">
          <p className="text-sm text-gray-400 mb-3">Quick add defaults:</p>
          <div className="flex flex-wrap gap-2">
            {defaultTemplates.slice(0, 3).map((t, i) => (
              <button
                key={i}
                onClick={() => addDefaultTemplate(t)}
                className="text-xs px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700 hover:bg-gray-700 transition"
              >
                + {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editingId ? 'Edit Template' : 'New Template'}</h2>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                  placeholder="My template"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat.key} value={cat.key}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Content</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500 h-32"
                placeholder="Write your template content here..."
              />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2">
                <Save size={18} /> Save
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="bg-gray-800 px-6 py-2.5 rounded-xl">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Templates by Category */}
        {categories.map(category => {
          const categoryTemplates = templates.filter(t => t.category === category.key);
          if (categoryTemplates.length === 0) return null;
          
          return (
            <div key={category.key} className="mb-6">
              <h3 className="text-lg font-semibold text-gray-300 mb-3 flex items-center gap-2">
                {category.label}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryTemplates.map(template => (
                  <div key={template.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-white">{template.name}</h4>
                      <div className="flex gap-1">
                        <button onClick={() => handleCopy(template.content, template.id)} className="p-1.5 text-gray-400 hover:text-green-400">
                          {copiedId === template.id ? <Save size={14} /> : <Copy size={14} />}
                        </button>
                        <button onClick={() => handleEdit(template)} className="p-1.5 text-gray-400 hover:text-blue-400">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(template.id)} className="p-1.5 text-gray-400 hover:text-red-400">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-3">{template.content}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {templates.length === 0 && !showForm && !isFetching && (
          <div className="text-center py-12 text-gray-500">
            <FileText size={48} className="mx-auto mb-3 opacity-30" />
            <p>No quick templates yet. Add one to get started!</p>
          </div>
        )}
          </>
        )}
      </div>
    </Layout>
  );
}
