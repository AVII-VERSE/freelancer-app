import { useState, useEffect } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Plus, Search, Trash2, Edit2, Save, X, User, Mail, Phone, MapPin, Star, DollarSign, Briefcase, ShieldCheck, CreditCard, CheckCircle } from 'lucide-react';
import Layout from '../components/layout/Layout';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  location: string;
  website: string;
  notes: string;
  projects: string;
  totalSpent: string;
  rating: number;
  isIdVerified: boolean;
  isPaymentVerified: boolean;
  isDepositMade: boolean;
  isEmailVerified: boolean;
  isProfileCompleted: boolean;
  isPhoneVerified: boolean;
  reviews: number;
  createdAt: string;
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    location: '',
    website: '',
    notes: '',
    projects: '0',
    totalSpent: '0',
    rating: 0,
    isIdVerified: false,
    isPaymentVerified: false,
    isDepositMade: false,
    isEmailVerified: false,
    isProfileCompleted: false,
    isPhoneVerified: false,
    reviews: 0,
  });

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data.clients || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Client name is required');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/clients/${editingId}`, form);
        toast.success('Client updated!');
      } else {
        await api.post('/clients', form);
        toast.success('Client added!');
      }
      setForm({ name: '', email: '', phone: '', company: '', location: '', website: '', notes: '', projects: '0', totalSpent: '0', rating: 0, isIdVerified: false, isPaymentVerified: false, isDepositMade: false, isEmailVerified: false, isProfileCompleted: false, isPhoneVerified: false, reviews: 0 });
      setShowForm(false);
      setEditingId(null);
      fetchClients();
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/clients/${id}`);
      toast.success('Deleted!');
      fetchClients();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleEdit = (client: Client) => {
    setForm({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      company: client.company || '',
      location: client.location || '',
      website: client.website || '',
      notes: client.notes || '',
      projects: client.projects || '0',
      totalSpent: client.totalSpent || '0',
      rating: client.rating || 0,
      isIdVerified: client.isIdVerified || false,
      isPaymentVerified: client.isPaymentVerified || false,
      isDepositMade: client.isDepositMade || false,
      isEmailVerified: client.isEmailVerified || false,
      isProfileCompleted: client.isProfileCompleted || false,
      isPhoneVerified: client.isPhoneVerified || false,
      reviews: client.reviews || 0,
    });
    setEditingId(client.id);
    setShowForm(true);
  };

  const filtered = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-8 text-white">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
              <User size={24} className="text-blue-500" /> Clients
            </h1>
            <p className="mt-1 text-gray-400">{clients.length} saved clients</p>
          </div>
          <button
            onClick={() => { setForm({ name: '', email: '', phone: '', company: '', location: '', website: '', notes: '', projects: '0', totalSpent: '0', rating: 0, isIdVerified: false, isPaymentVerified: false, isDepositMade: false, isEmailVerified: false, isProfileCompleted: false, isPhoneVerified: false, reviews: 0 }); setEditingId(null); setShowForm(true); }}
            className="px-5 py-2.5 rounded-xl flex items-center gap-2 transition font-medium text-white bg-blue-500 hover:bg-blue-600"
          >
            <Plus size={18} /> Add Client
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl pl-10 pr-4 py-3 border bg-gray-800 border-gray-700 text-white focus:outline-none focus:border-blue-500"
              placeholder="Search clients..."
            />
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="rounded-2xl p-6 mb-6 space-y-4 bg-gray-800 border border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{editingId ? 'Edit Client' : 'Add New Client'}</h2>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Company</label>
                <input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                  placeholder="Acme Inc"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Location</label>
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                  placeholder="New York, USA"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Website</label>
                <input
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Projects</label>
                <input
                  type="number"
                  value={form.projects}
                  onChange={(e) => setForm({ ...form, projects: e.target.value })}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Total Spent</label>
                <input
                  value={form.totalSpent}
                  onChange={(e) => setForm({ ...form, totalSpent: e.target.value })}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                  placeholder="$0"
                />
              </div>
            </div>

            {/* Verification Badges */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Client Verification</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isIdVerified}
                    onChange={(e) => setForm({ ...form, isIdVerified: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-gray-300 flex items-center gap-1"><ShieldCheck size={14} className="text-green-400" /> Client Identity Verified</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPaymentVerified}
                    onChange={(e) => setForm({ ...form, isPaymentVerified: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-gray-300 flex items-center gap-1"><CreditCard size={14} className="text-green-400" /> Payment Verified</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isDepositMade}
                    onChange={(e) => setForm({ ...form, isDepositMade: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-gray-300 flex items-center gap-1"><DollarSign size={14} className="text-green-400" /> Deposit Made</span>
                </label>
              </div>
              <div className="mt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.reviews >= 1}
                    onChange={(e) => setForm({ ...form, reviews: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 rounded"
                    disabled
                  />
                  <span className="text-sm text-gray-300 flex items-center gap-1"><CheckCircle size={14} className="text-green-400" /> 1+ Reviews</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Client must have at least 1 review to be verified</p>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500 h-24"
                placeholder="Additional notes about this client..."
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

        {/* Clients Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <User size={48} className="mx-auto mb-3 opacity-30" />
            <p>No clients found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(client => (
              <div key={client.id} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{client.name}</h3>
                      {client.company && <p className="text-sm text-gray-400">{client.company}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(client)} className="p-1.5 text-gray-400 hover:text-blue-400">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(client.id)} className="p-1.5 text-gray-400 hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {client.email && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Mail size={12} /> {client.email}
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Phone size={12} /> {client.phone}
                    </div>
                  )}
                  {client.location && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <MapPin size={12} /> {client.location}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-800">
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <Briefcase size={12} /> {client.projects} projects
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <DollarSign size={12} /> {client.totalSpent}
                  </div>
                  {client.rating > 0 && (
                    <div className="flex items-center gap-1 text-sm text-yellow-400">
                      <Star size={12} fill="currentColor" /> {client.rating}
                    </div>
                  )}
                  {client.reviews > 0 && (
                    <div className="flex items-center gap-1 text-sm text-green-400">
                      <CheckCircle size={12} /> {client.reviews} reviews
                    </div>
                  )}
                </div>

                {/* Verification Badges */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {client.isIdVerified && <span className="text-xs px-2 py-0.5 rounded-full bg-green-900/30 text-green-400 border border-green-800"><ShieldCheck size={10} className="inline mr-1" />Client Identity Verified</span>}
                  {client.isPaymentVerified && <span className="text-xs px-2 py-0.5 rounded-full bg-green-900/30 text-green-400 border border-green-800"><CreditCard size={10} className="inline mr-1" />Payment Verified</span>}
                  {client.isDepositMade && <span className="text-xs px-2 py-0.5 rounded-full bg-green-900/30 text-green-400 border border-green-800">Deposit Made</span>}
                  {client.reviews >= 1 && <span className="text-xs px-2 py-0.5 rounded-full bg-green-900/30 text-green-400 border border-green-800"><CheckCircle size={10} className="inline mr-1" />1+ Reviews</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
