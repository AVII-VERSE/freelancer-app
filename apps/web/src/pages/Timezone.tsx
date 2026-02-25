import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { Clock, Bell, Globe, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

interface TimezoneAlert {
  id: string;
  name: string;
  timezone: string;
  alertTime: string;
  enabled: boolean;
}

const TIMEZONE_DATA = [
  { name: 'USA (East)', timezone: 'America/New_York', bestTimes: ['9:00 AM', '12:00 PM', '3:00 PM'], flag: '🇺🇸' },
  { name: 'USA (West)', timezone: 'America/Los_Angeles', bestTimes: ['9:00 AM', '12:00 PM', '5:00 PM'], flag: '🇺🇸' },
  { name: 'United Kingdom', timezone: 'Europe/London', bestTimes: ['9:00 AM', '1:00 PM', '4:00 PM'], flag: '🇬🇧' },
  { name: 'Australia', timezone: 'Australia/Sydney', bestTimes: ['9:00 AM', '12:00 PM', '3:00 PM'], flag: '🇦🇺' },
  { name: 'Canada', timezone: 'America/Toronto', bestTimes: ['9:00 AM', '12:00 PM', '3:00 PM'], flag: '🇨🇦' },
  { name: 'Germany', timezone: 'Europe/Berlin', bestTimes: ['9:00 AM', '1:00 PM', '4:00 PM'], flag: '🇩🇪' },
  { name: 'UAE', timezone: 'Asia/Dubai', bestTimes: ['9:00 AM', '12:00 PM', '5:00 PM'], flag: '🇦🇪' },
  { name: 'Singapore', timezone: 'Asia/Singapore', bestTimes: ['9:00 AM', '12:00 PM', '3:00 PM'], flag: '🇸🇬' },
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
    api.get('/timezone')
      .then(res => {
        console.log('API Response:', res.data);
        if (res.data && res.data.alerts) {
          setAlerts(res.data.alerts);
        }
      })
      .catch(err => {
        console.error('Failed to load timezone alerts:', err);
      });
  }, []);

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

  const handleAddAlert = async () => {
    if (!selected) return;
    const tz = TIMEZONE_DATA.find((t) => t.timezone === selected);
    if (!tz) return;
    if (alerts.find((a) => a.timezone === selected)) {
      toast.error('Already added!');
      return;
    }
    try {
      console.log('Creating alert:', { name: tz.name, timezone: tz.timezone, alertTime: tz.bestTimes[0] });
      const res = await api.post('/timezone', {
        name: tz.name,
        timezone: tz.timezone,
        alertTime: tz.bestTimes[0],
      });
      console.log('Create response:', res.data);
      if (res.data.alert) {
        setAlerts([...alerts, res.data.alert]);
        toast.success(`Alert added for ${tz.name}!`);
      }
    } catch (err: any) {
      console.error('Failed to add alert:', err);
      toast.error(err.response?.data?.message || 'Failed to add alert');
    }
    setShowAdd(false);
    setSelected('');
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/timezone/${id}`);
      setAlerts(alerts.filter((a) => a.id !== id));
      toast.success('Alert removed');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleToggle = async (alert: TimezoneAlert) => {
    try {
      await api.put(`/timezone/${alert.id}`, {
        enabled: !alert.enabled,
      });
      setAlerts(alerts.map((a) => a.id === alert.id ? { ...a, enabled: !a.enabled } : a));
    } catch {
      toast.error('Failed to update');
    }
  };

  return (
    <Layout>
      <div className="p-8 text-white">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Clock size={24} className="text-blue-400" /> Timezone Alerts
          </h1>
          <p className="text-gray-400 mt-1">Track best times to contact clients worldwide</p>
        </div>

        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition font-medium"
          >
            <Plus size={18} /> Add Timezone
          </button>
        </div>

        {showAdd && (
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-6">
            <h2 className="text-lg font-semibold mb-4">Select Timezone</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {TIMEZONE_DATA.map((tz) => (
                <button
                  key={tz.timezone}
                  onClick={() => setSelected(tz.timezone)}
                  className={`p-4 rounded-xl border transition ${
                    selected === tz.timezone
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <span className="text-2xl block mb-1">{tz.flag}</span>
                  <span className="text-sm text-white">{tz.name}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddAlert}
                disabled={!selected}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl transition disabled:opacity-50"
              >
                Add Alert
              </button>
              <button
                onClick={() => { setShowAdd(false); setSelected(''); }}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2.5 rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {alerts.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-16 bg-gray-900 rounded-2xl border border-gray-800">
              <Globe size={40} className="mx-auto mb-3 opacity-30" />
              <p>No timezone alerts added</p>
              <p className="text-sm mt-1">Click "Add Timezone" to get started</p>
            </div>
          )}
          {alerts.map((alert) => {
            const tzData = TIMEZONE_DATA.find((t) => t.timezone === alert.timezone);
            return (
              <div
                key={alert.id}
                className={`bg-gray-900 rounded-2xl border p-5 ${
                  alert.enabled && tzData && isBestTimeNow(alert.timezone, tzData.bestTimes)
                    ? 'border-green-500/50 bg-green-500/5'
                    : 'border-gray-800'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{tzData?.flag}</span>
                    <div>
                      <h3 className="font-semibold text-white">{alert.name}</h3>
                      <p className="text-xs text-gray-500">{alert.timezone}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(alert.id)}
                    className="text-gray-500 hover:text-red-400 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="mb-3">
                  <p className="text-2xl font-bold text-white">{times[alert.timezone] || '--:--:--'}</p>
                  <p className="text-sm text-gray-500">{getCurrentDate(alert.timezone)}</p>
                </div>

                {alert.enabled && tzData && isBestTimeNow(alert.timezone, tzData.bestTimes) && (
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-2 mb-3">
                    <p className="text-green-400 text-sm flex items-center gap-1">
                      <Bell size={12} /> Best time to contact now!
                    </p>
                  </div>
                )}

                <button
                  onClick={() => handleToggle(alert)}
                  className={`w-full py-2 rounded-lg text-sm font-medium transition ${
                    alert.enabled
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {alert.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
