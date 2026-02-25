import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { Clock, Globe, Plus, Trash2, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

interface TimezoneAlert {
  id: string;
  name: string;
  timezone: string;
  alertTime: string;
  enabled: boolean;
  createdAt?: string;
}

const ALL_TIMEZONES = [
  { name: 'USA (East)', timezone: 'America/New_York', offset: -5, flag: '🇺🇸' },
  { name: 'USA (West)', timezone: 'America/Los_Angeles', offset: -8, flag: '🇺🇸' },
  { name: 'USA (Central)', timezone: 'America/Chicago', offset: -6, flag: '🇺🇸' },
  { name: 'United Kingdom', timezone: 'Europe/London', offset: 0, flag: '🇬🇧' },
  { name: 'Germany', timezone: 'Europe/Berlin', offset: 1, flag: '🇩🇪' },
  { name: 'France', timezone: 'Europe/Paris', offset: 1, flag: '🇫🇷' },
  { name: 'Netherlands', timezone: 'Europe/Amsterdam', offset: 1, flag: '🇳🇱' },
  { name: 'Australia (Sydney)', timezone: 'Australia/Sydney', offset: 11, flag: '🇦🇺' },
  { name: 'Australia (Melbourne)', timezone: 'Australia/Melbourne', offset: 11, flag: '🇦🇺' },
  { name: 'Canada (Toronto)', timezone: 'America/Toronto', offset: -5, flag: '🇨🇦' },
  { name: 'Canada (Vancouver)', timezone: 'America/Vancouver', offset: -8, flag: '🇨🇦' },
  { name: 'UAE', timezone: 'Asia/Dubai', offset: 4, flag: '🇦🇪' },
  { name: 'India', timezone: 'Asia/Kolkata', offset: 5.5, flag: '🇮🇳' },
  { name: 'Singapore', timezone: 'Asia/Singapore', offset: 8, flag: '🇸🇬' },
  { name: 'Japan', timezone: 'Asia/Tokyo', offset: 9, flag: '🇯🇵' },
  { name: 'South Korea', timezone: 'Asia/Seoul', offset: 9, flag: '🇰🇷' },
  { name: 'China', timezone: 'Asia/Shanghai', offset: 8, flag: '🇨🇳' },
  { name: 'Hong Kong', timezone: 'Asia/Hong_Kong', offset: 8, flag: '🇭🇰' },
  { name: 'Brazil', timezone: 'America/Sao_Paulo', offset: -3, flag: '🇧🇷' },
  { name: 'Mexico', timezone: 'America/Mexico_City', offset: -6, flag: '🇲🇽' },
  { name: 'New Zealand', timezone: 'Pacific/Auckland', offset: 13, flag: '🇳🇿' },
  { name: 'South Africa', timezone: 'Africa/Johannesburg', offset: 2, flag: '🇿🇦' },
  { name: 'Russia (Moscow)', timezone: 'Europe/Moscow', offset: 3, flag: '🇷🇺' },
  { name: 'Israel', timezone: 'Asia/Jerusalem', offset: 2, flag: '🇮🇱' },
];

function getCurrentTimeInZone(timezone: string) {
  try {
    return new Date().toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return '--:--:--';
  }
}

function getCurrentDateInZone(timezone: string) {
  try {
    return new Date().toLocaleDateString('en-US', {
      timeZone: timezone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '---';
  }
}

function getTimeDifference(timezone: string) {
  try {
    const now = new Date();
    const localTime = now.getTime();
    const targetTime = new Date(now.toLocaleString('en-US', { timeZone: timezone })).getTime();
    const diff = Math.round((targetTime - localTime) / (1000 * 60 * 60));
    if (diff === 0) return 'Same time';
    if (diff > 0) return `+${diff}h`;
    return `${diff}h`;
  } catch {
    return '';
  }
}

export default function Timezone() {
  const [times, setTimes] = useState<Record<string, string>>({});
  const [alerts, setAlerts] = useState<TimezoneAlert[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/timezone')
      .then(res => {
        if (res.data?.alerts) {
          setAlerts(res.data.alerts);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const update = () => {
      const updated: Record<string, string> = {};
      ALL_TIMEZONES.forEach((tz) => {
        updated[tz.timezone] = getCurrentTimeInZone(tz.timezone);
      });
      setTimes(updated);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAdd = async (tz: typeof ALL_TIMEZONES[0]) => {
    if (alerts.find((a) => a.timezone === tz.timezone)) {
      toast.error('Already in your list!');
      return;
    }
    try {
      const res = await api.post('/timezone', {
        name: tz.name,
        timezone: tz.timezone,
        alertTime: '9:00 AM',
      });
      if (res.data?.alert) {
        setAlerts([...alerts, res.data.alert]);
        toast.success(`Added ${tz.name}!`);
      }
    } catch {
      toast.error('Failed to add');
    }
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/timezone/${id}`);
      setAlerts(alerts.filter((a) => a.id !== id));
      toast.success('Removed');
    } catch {
      toast.error('Failed to remove');
    }
  };

  const handleToggle = async (alert: TimezoneAlert) => {
    try {
      await api.put(`/timezone/${alert.id}`, { enabled: !alert.enabled });
      setAlerts(alerts.map((a) => a.id === alert.id ? { ...a, enabled: !a.enabled } : a));
    } catch {
      toast.error('Failed to update');
    }
  };

  const filteredTimezones = ALL_TIMEZONES.filter(tz =>
    tz.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const myTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <Layout>
      <div className="p-8 text-white">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Clock size={24} className="text-blue-400" /> Timezone World
            </h1>
            <p className="text-gray-400 mt-1">Track time zones for your clients worldwide</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition font-medium"
          >
            <Plus size={18} /> Add Timezone
          </button>
        </div>

        {/* Your Time */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-6 border border-blue-500/30 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Your Local Time</p>
              <p className="text-3xl font-bold text-white mt-1">
                {getCurrentTimeInZone(myTimezone)}
              </p>
              <p className="text-gray-400 text-sm mt-1">{getCurrentDateInZone(myTimezone)}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Timezone</p>
              <p className="text-white font-medium">{myTimezone}</p>
            </div>
          </div>
        </div>

        {/* Alert Cards Grid */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading...</div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/50 rounded-2xl border border-gray-800">
            <Globe size={48} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 text-lg">No timezones added yet</p>
            <p className="text-gray-500 text-sm mt-2">Click "Add Timezone" to start tracking</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {alerts.map((alert) => {
              const tzData = ALL_TIMEZONES.find(t => t.timezone === alert.timezone);
              return (
                <div
                  key={alert.id}
                  className={`bg-gray-900 rounded-2xl border p-5 relative group transition hover:border-gray-600 ${
                    !alert.enabled ? 'opacity-60' : ''
                  }`}
                >
                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(alert.id)}
                    className="absolute top-3 right-3 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 size={16} />
                  </button>

                  {/* Flag & Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{tzData?.flag}</span>
                    <div>
                      <h3 className="font-semibold text-white">{alert.name}</h3>
                      <p className="text-xs text-gray-500">{alert.timezone}</p>
                    </div>
                  </div>

                  {/* Time Display */}
                  <div className="mb-3">
                    <p className="text-2xl font-bold text-white">
                      {times[alert.timezone] || '--:--:--'}
                    </p>
                    <p className="text-sm text-gray-500">{getCurrentDateInZone(alert.timezone)}</p>
                  </div>

                  {/* Time Difference */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded">
                      {getTimeDifference(alert.timezone)}
                    </span>
                    <button
                      onClick={() => handleToggle(alert)}
                      className={`text-xs px-3 py-1 rounded-full transition ${
                        alert.enabled
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      {alert.enabled ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[80vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">Add Timezone</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-gray-800">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search timezone..."
                    className="w-full bg-gray-800 text-white rounded-xl pl-10 pr-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Timezone List */}
              <div className="p-4 overflow-y-auto max-h-96">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {filteredTimezones.map((tz) => {
                    const isAdded = alerts.some(a => a.timezone === tz.timezone);
                    return (
                      <button
                        key={tz.timezone}
                        onClick={() => !isAdded && handleAdd(tz)}
                        disabled={isAdded}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition text-left ${
                          isAdded
                            ? 'border-green-500/30 bg-green-500/5 cursor-not-allowed'
                            : 'border-gray-700 hover:border-blue-500 hover:bg-blue-500/5'
                        }`}
                      >
                        <span className="text-2xl">{tz.flag}</span>
                        <div className="flex-1">
                          <p className="text-white font-medium">{tz.name}</p>
                          <p className="text-xs text-gray-500">UTC{tz.offset >= 0 ? '+' : ''}{tz.offset}</p>
                        </div>
                        {isAdded && (
                          <span className="text-green-400 text-sm">Added</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
