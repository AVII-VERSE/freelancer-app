import { useEffect, useState } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { User, MapPin, DollarSign, Briefcase, Code, Globe, Save, Loader2 } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useAuthStore } from '../store/auth.store';

export default function Profile() {
  const { user, loadUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [profileData, setProfileData] = useState({
    name: '',
    timezone: '',
    bio: '',
    skills: '',
    experience: '',
    hourlyRate: '',
    platforms: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, profileRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/profile'),
        ]);
        const u = userRes.data.user;
        const p = profileRes.data.profile;
        
        setProfileData({
          name: u.name || '',
          timezone: u.timezone || '',
          bio: p?.bio || '',
          skills: p?.skills?.join(', ') || '',
          experience: p?.experience || '',
          hourlyRate: p?.hourlyRate?.toString() || '',
          platforms: p?.platforms?.join(', ') || '',
        });
      } catch (error) {
        console.error(error);
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/profile/user', {
        name: profileData.name,
        timezone: profileData.timezone,
      });
      
      await api.put('/profile', {
        bio: profileData.bio,
        skills: profileData.skills.split(',').map(s => s.trim()).filter(Boolean),
        experience: profileData.experience,
        hourlyRate: profileData.hourlyRate ? parseFloat(profileData.hourlyRate) : undefined,
        platforms: profileData.platforms.split(',').map(s => s.trim()).filter(Boolean),
      });
      
      toast.success('Profile updated!');
      loadUser();
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  if (fetching) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8 text-white max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <User size={24} className="text-blue-400" /> Profile Settings
          </h1>
          <p className="text-gray-400 mt-1">Manage your account and profile information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <User size={18} className="text-blue-400" /> Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full bg-gray-800/50 text-gray-400 rounded-xl px-4 py-3 border border-gray-700 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                  <MapPin size={14} /> Timezone
                </label>
                <input
                  type="text"
                  value={profileData.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                  placeholder="Asia/Kolkata"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                  <DollarSign size={14} /> Hourly Rate ($)
                </label>
                <input
                  type="number"
                  value={profileData.hourlyRate}
                  onChange={(e) => handleChange('hourlyRate', e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                  placeholder="50"
                />
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <Briefcase size={18} className="text-blue-400" /> Professional Details
            </h2>
            <div className="space-y-5">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500 h-28 resize-none"
                  placeholder="Tell clients about yourself..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                    <Code size={14} /> Skills
                  </label>
                  <input
                    type="text"
                    value={profileData.skills}
                    onChange={(e) => handleChange('skills', e.target.value)}
                    className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                    placeholder="React, Node.js, TypeScript"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate skills with commas</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                    <Globe size={14} /> Platforms
                  </label>
                  <input
                    type="text"
                    value={profileData.platforms}
                    onChange={(e) => handleChange('platforms', e.target.value)}
                    className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                    placeholder="Upwork, Fiverr, Freelancer"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate platforms with commas</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                  <Briefcase size={14} /> Experience
                </label>
                <textarea
                  value={profileData.experience}
                  onChange={(e) => handleChange('experience', e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500 h-24 resize-none"
                  placeholder="5+ years in web development..."
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save size={18} /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
