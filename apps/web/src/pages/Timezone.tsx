import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { Clock, Bell, Globe, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface TimezoneAlert {
  id: string;
  country: string;
  timezone: string;
  bestTimes: string[];
  enabled: boolean;
}

const TIMEZONE_DATA = [
  { country: 'USA (East)', timezone: 'America/New_York', bestTimes: ['9:00 AM', '12:00 PM', '3:00 PM'], flag: '🇺🇸' },
  { country: 'USA (West)', timezone: 'America/Los_Angeles', bestTimes: ['9:00 AM', '12:00 PM', '5:00 PM'], flag: '🇺🇸' },
  { country: 'United Kingdom', timezone: 'Europe/London', bestTimes: ['9:00 AM', '1:00 PM', '4:00 PM'], flag: '🇬🇧' },
  { country: 'Australia', timezone: 'Australia/Sydney', bestTimes: ['9:00 AM', '12:00 PM', '3:00 PM'], flag: '🇦🇺' },
  { country: 'Canada', timezone: 'America/Toronto', bestTimes: ['9:00 AM', '12:00 PM', '3:00 PM'], flag: '🇨🇦' },
  { country: 'Germany', timezone: 'Europe/Berlin', bestTimes: ['9:00 AM', '1:00 PM', '4:00 PM'], flag: '🇩🇪' },
  { country: 'UAE', timezone: 'Asia/Dubai', bestTimes: ['9:00 AM', '12:00 PM', '5:00 PM'], flag: '🇦🇪' },
  { country: 'Singapore', timezone: 'Asia/Singapore', bestTimes: ['9:00 AM', '12:00 PM', '3:00 PM'], flag: '🇸🇬' },
];

function getCurrentTime(timezone: string) {
  return new Date().toLocaleTimeString('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

function getCurrentDate(timezone: string) {
  return new Date().toLocaleDateString('en-US', {
    timeZone: timezone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function isBestTimeNow(timezone: string, bestTimes: string[]) {
  const now = new Date().toLocaleTimeString('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    hour12: true,
  });
  const currentHour = parseInt(now);
  const period = now.includes('AM') ? 'AM' : 'PM';

  return bestTimes.some((t) => {
    const [time, p] = t.split(' ');
    const hour = parseInt(time.split(':')[0]);
    return Math.abs(currentHour - hour) <= 1 && period === p;
  });
}

export default function Timezone() {
  const [times, setTimes] = useState<Record<string, string>>({});
  const [alerts, setAlerts] = useState<TimezoneAlert[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    const update = () => {
      const updated: Record<string, string> = {};
      TIMEZONE_DATA.forEach((tz) => {
        updated[tz.timezone] = getCurrentTime(tz.timezone);
      });
      setTimes(updated);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAddAlert = () => {
    if (!selected) return;
    const tz = TIMEZONE_DATA.find((t) => t.timezone === selected);
    if (!tz) return;
    if (alerts.find((a) => a.timezone === selected)) {
      toast.error('Already added!');
      return;
    }
    const newAlert: TimezoneAlert = {
      id: Date.now().toString(),
      country: tz.country,
      timezone: tz.timezone,
      bestTimes: tz.bestTimes,
      enabled: true,
    };
    setAlerts([...alerts, newAlert]);
    setShowAdd(false);
    setSelected('');
    toast.success(`Alert added for ${tz.country}!`);
  };

  const handleDelete = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
    toast.success('Alert removed');
  };

  const handleToggle = (id: string) => {
    setAlerts(alerts.map((a) => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  return (
    <Layout>
      <div className="p-8 text-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Clock size={24} className="text-orange-400" /> Timezone Alerts
            </h1>
            <p className="text-gray-400 mt-1">Track best bidding times across the world</p>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition font-medium"
          >
            <Plus size={18} /> Add Alert
          </button>
        </div>

        {/* Add Alert */}
        {showAdd && (
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-6 flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm text-gray-400 mb-1 block">Select Country/Timezone</label>
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-orange-500"
              >
                <option value="">Choose a timezone...</option>
                {TIMEZONE_DATA.map((tz) => (
                  <option key={tz.timezone} value={tz.timezone}>
                    {tz.flag} {tz.country}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAddAlert}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-medium transition"
            >
              Add
            </button>
          </div>
        )}

        {/* My Alerts */}
        {alerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Bell size={18} className="text-orange-400" /> My Alerts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerts.map((alert) => {
                const isHot = isBestTimeNow(alert.timezone, alert.bestTimes);
                return (
                  <div
                    key={alert.id}
                    className={`bg-gray-900 rounded-2xl p-5 border ${isHot && alert.enabled ? 'border-orange-500/50' : 'border-gray-800'} relative overflow-hidden`}
                  >
                    {isHot && alert.enabled && (
                      <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs px-3 py-1 rounded-bl-xl font-bold">
                        🔥 HOT TIME
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-white">{alert.country}</h3>
                        <p className="text-gray-500 text-xs">{alert.timezone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggle(alert.id)}
                          className={`w-10 h-5 rounded-full transition-colors relative ${alert.enabled ? 'bg-orange-500' : 'bg-gray-700'}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${alert.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                        <button
                          onClick={() => handleDelete(alert.id)}
                          className="text-gray-600 hover:text-red-400 transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-white font-mono">
                      {times[alert.timezone] || '--:--'}
                    </p>
                    <div className="mt-3">
                      <p className="text-gray-500 text-xs mb-2">Best times to bid:</p>
                      <div className="flex gap-2 flex-wrap">
                        {alert.bestTimes.map((t) => (
                          <span key={t} className="text-xs px-2 py-1 rounded-lg bg-orange-400/10 text-orange-400 border border-orange-400/20">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* World Clock */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Globe size={18} className="text-blue-400" /> World Clock
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TIMEZONE_DATA.map((tz) => {
              const isHot = isBestTimeNow(tz.timezone, tz.bestTimes);
              return (
                <div
                  key={tz.timezone}
                  className={`bg-gray-900 rounded-2xl p-5 border ${isHot ? 'border-green-500/40' : 'border-gray-800'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{tz.flag}</span>
                    {isHot && (
                      <span className="text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-white font-semibold text-sm">{tz.country}</p>
                  <p className="text-gray-500 text-xs mb-2">{getCurrentDate(tz.timezone)}</p>
                  <p className="text-xl font-bold text-white font-mono">
                    {times[tz.timezone] || '--:--'}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {tz.bestTimes.map((t) => (
                      <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}