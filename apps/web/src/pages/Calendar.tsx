import { useState, useEffect } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Plus, Calendar as CalendarIcon, Clock, Video, Phone, Trash2, Edit2, ChevronLeft, ChevronRight, User, RefreshCw } from 'lucide-react';
import Layout from '../components/layout/Layout';

interface Meeting {
  id: string;
  title: string;
  clientName: string;
  date: string;
  time: string;
  timezone: string;
  type: 'video' | 'phone' | 'chat';
  notes: string;
  isRecurring: boolean;
  recurrence?: string;
  recurrenceEnd?: string;
  createdAt: string;
}

const timezones = [
  'UTC', 'America/New_York', 'America/Los_Angeles', 'America/Chicago', 
  'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'Asia/Tokyo', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Singapore',
  'Australia/Sydney', 'Pacific/Auckland'
];

const timeSlots = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', 
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', 
  '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
];

export default function Calendar() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [form, setForm] = useState({
    title: '',
    clientName: '',
    date: '',
    time: '10:00',
    timezone: 'UTC',
    type: 'video',
    notes: '',
    isRecurring: false,
    recurrence: 'weekly',
    recurrenceEnd: '',
  });

  const fetchMeetings = async () => {
    try {
      const res = await api.get('/meetings');
      setMeetings(res.data.meetings || []);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    }
  };

  useEffect(() => { fetchMeetings(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date) {
      toast.error('Title and date are required');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/meetings/${editingId}`, form);
        toast.success('Meeting updated!');
      } else {
        await api.post('/meetings', form);
        toast.success('Meeting scheduled!');
      }
      setForm({ title: '', clientName: '', date: '', time: '10:00', timezone: 'UTC', type: 'video', notes: '', isRecurring: false, recurrence: 'weekly', recurrenceEnd: '' });
      setShowForm(false);
      setEditingId(null);
      fetchMeetings();
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/meetings/${id}`);
      toast.success('Deleted!');
      fetchMeetings();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleEdit = (meeting: Meeting) => {
    setForm({
      title: meeting.title,
      clientName: meeting.clientName,
      date: meeting.date,
      time: meeting.time,
      timezone: meeting.timezone,
      type: meeting.type,
      notes: meeting.notes,
      isRecurring: meeting.isRecurring,
      recurrence: meeting.recurrence || 'weekly',
      recurrenceEnd: meeting.recurrenceEnd || '',
    });
    setEditingId(meeting.id);
    setShowForm(true);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Add empty slots for days before first day of month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    // Add all days of month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getMeetingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return meetings.filter(m => m.date === dateStr);
  };

  const today = new Date();
  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <Layout>
      <div className="p-8 text-white">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <CalendarIcon size={24} className="text-blue-400" /> Calendar
            </h1>
            <p className="text-gray-400 mt-1">{meetings.length} scheduled meetings</p>
          </div>
          <button
            onClick={() => { setForm({ title: '', clientName: '', date: '', time: '10:00', timezone: 'UTC', type: 'video', notes: '', isRecurring: false, recurrence: 'weekly', recurrenceEnd: '' }); setEditingId(null); setShowForm(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition font-medium"
          >
            <Plus size={18} /> Schedule Meeting
          </button>
        </div>

        {/* Calendar Header */}
        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="p-2 hover:bg-gray-800 rounded-lg">
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-semibold">{monthName}</h2>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="p-2 hover:bg-gray-800 rounded-lg">
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm text-gray-500 py-2">{day}</div>
            ))}
            {days.map((date, i) => {
              if (!date) return <div key={i} className="h-20" />;
              
              const dayMeetings = getMeetingsForDate(date);
              const isToday = date.toDateString() === today.toDateString();
              
              return (
                <div key={i} className={`h-20 p-1 rounded-lg border ${isToday ? 'border-blue-500 bg-blue-500/10' : 'border-gray-800'} hover:bg-gray-800/50 cursor-pointer`}>
                  <div className={`text-sm ${isToday ? 'text-blue-400 font-bold' : 'text-gray-400'}`}>{date.getDate()}</div>
                  {dayMeetings.slice(0, 2).map(m => (
                    <div key={m.id} className="text-xs bg-blue-500/20 text-blue-400 px-1 py-0.5 rounded truncate">{m.time} {m.title}</div>
                  ))}
                  {dayMeetings.length > 2 && <div className="text-xs text-gray-500">+{dayMeetings.length - 2} more</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h2 className="text-lg font-semibold mb-4">Upcoming Meetings</h2>
          
          {meetings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CalendarIcon size={40} className="mx-auto mb-2 opacity-30" />
              <p>No meetings scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {meetings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(meeting => (
                <div key={meeting.id} className="flex items-center justify-between bg-gray-800 rounded-xl p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      {meeting.type === 'video' ? <Video size={20} className="text-blue-400" /> : meeting.type === 'phone' ? <Phone size={20} className="text-green-400" /> : <User size={20} className="text-purple-400" />}
                    </div>
                    <div>
                      <h3 className="font-medium text-white flex items-center gap-2">
                        {meeting.title}
                        {meeting.isRecurring && <span title="Recurring meeting"><RefreshCw size={14} className="text-blue-400" /></span>}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span className="flex items-center gap-1"><CalendarIcon size={12} /> {meeting.date}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {meeting.time}</span>
                        {meeting.clientName && <span className="flex items-center gap-1"><User size={12} /> {meeting.clientName}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(meeting)} className="p-2 text-gray-400 hover:text-blue-400">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(meeting.id)} className="p-2 text-gray-400 hover:text-red-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Meeting Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-800">
              <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Meeting' : 'Schedule Meeting'}</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Title *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                    placeholder="Project discussion"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Client Name</label>
                  <input
                    value={form.clientName}
                    onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Date *</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Time</label>
                    <select
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                      className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                    >
                      {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Timezone</label>
                  <select
                    value={form.timezone}
                    onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                  >
                    {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Meeting Type</label>
                  <div className="flex gap-2">
                    {(['video', 'phone', 'chat'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm({ ...form, type: type as 'video' | 'phone' | 'chat' })}
                        className={`flex-1 py-2 rounded-xl capitalize ${form.type === type ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500 h-20"
                    placeholder="Meeting notes..."
                  />
                </div>

                {/* Recurring Meeting */}
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <label className="flex items-center gap-2 cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      checked={form.isRecurring}
                      onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">Recurring Meeting</span>
                  </label>
                  
                  {form.isRecurring && (
                    <div className="space-y-3 ml-6">
                      <div>
                        <label className="text-sm text-gray-400 mb-1 block">Recurrence Pattern</label>
                        <select
                          value={form.recurrence}
                          onChange={(e) => setForm({ ...form, recurrence: e.target.value })}
                          className="w-full bg-gray-800 text-white rounded-xl px-4 py-2 border border-gray-700 focus:outline-none focus:border-blue-500"
                        >
                          <option value="weekly">Weekly</option>
                          <option value="daily">Daily</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-1 block">End Date (optional)</label>
                        <input
                          type="date"
                          value={form.recurrenceEnd}
                          onChange={(e) => setForm({ ...form, recurrenceEnd: e.target.value })}
                          className="w-full bg-gray-800 text-white rounded-xl px-4 py-2 border border-gray-700 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl">
                    {editingId ? 'Update' : 'Schedule'}
                  </button>
                  <button type="button" onClick={() => { setForm({ title: '', clientName: '', date: '', time: '10:00', timezone: 'UTC', type: 'video', notes: '', isRecurring: false, recurrence: 'weekly', recurrenceEnd: '' }); setShowForm(false); setEditingId(null); }} className="px-6 py-3 bg-gray-800 rounded-xl">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
