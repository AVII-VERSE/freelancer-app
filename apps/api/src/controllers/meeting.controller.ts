import { Request, Response } from 'express';

type MeetingRecord = {
  id: string;
  userId: string;
  title: string;
  clientName?: string;
  date: string;
  time?: string;
  timezone?: string;
  type?: string;
  notes?: string;
  isRecurring: boolean;
  recurrence?: string | null;
  recurrenceEnd?: string | null;
  createdAt: string;
};

const meetingStore = new Map<string, MeetingRecord[]>();

export const getMeetings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const meetings = [...(meetingStore.get(userId) || [])].sort((a, b) => a.date.localeCompare(b.date));
    res.json({ meetings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createMeeting = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { title, clientName, date, time, timezone, type, notes, isRecurring, recurrence, recurrenceEnd } = req.body;

    if (!title || !date) {
      return res.status(400).json({ message: 'Title and date are required' });
    }

    const meeting: MeetingRecord = {
      id: `meeting_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId,
      title,
      clientName,
      date,
      time,
      timezone,
      type,
      notes,
      isRecurring: Boolean(isRecurring),
      recurrence: recurrence || null,
      recurrenceEnd: recurrenceEnd || null,
      createdAt: new Date().toISOString(),
    };

    const meetings = meetingStore.get(userId) || [];
    meetingStore.set(userId, [meeting, ...meetings]);

    res.status(201).json({ meeting });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateMeeting = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const id = String(req.params.id);
    const { title, clientName, date, time, timezone, type, notes, isRecurring, recurrence, recurrenceEnd } = req.body;

    const meetings = meetingStore.get(userId) || [];
    const idx = meetings.findIndex((m) => m.id === id);
    const existing = idx >= 0 ? meetings[idx] : null;

    if (!existing) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    const meeting: MeetingRecord = {
      ...existing,
      title,
      clientName,
      date,
      time,
      timezone,
      type,
      notes,
      isRecurring: Boolean(isRecurring),
      recurrence: recurrence || null,
      recurrenceEnd: recurrenceEnd || null,
    };

    meetings[idx] = meeting;
    meetingStore.set(userId, meetings);

    res.json({ meeting });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteMeeting = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const id = String(req.params.id);
    const meetings = meetingStore.get(userId) || [];
    const existing = meetings.find((m) => m.id === id);

    if (!existing) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    meetingStore.set(
      userId,
      meetings.filter((m) => m.id !== id)
    );

    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
