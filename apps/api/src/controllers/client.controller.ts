import { Request, Response } from 'express';

type ClientRecord = {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  location?: string;
  website?: string;
  notes?: string;
  projects?: string;
  totalSpent?: string;
  rating?: number;
  createdAt: string;
};

const clientStore = new Map<string, ClientRecord[]>();

export const getClients = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const clients = clientStore.get(userId) || [];
    res.json({ clients });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createClient = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name, email, phone, company, location, website, notes, projects, totalSpent, rating } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Client name is required' });
    }

    const client: ClientRecord = {
      id: `client_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId,
      name,
      email,
      phone,
      company,
      location,
      website,
      notes,
      projects: projects || '0',
      totalSpent: totalSpent || '0',
      rating,
      createdAt: new Date().toISOString(),
    };

    const clients = clientStore.get(userId) || [];
    clientStore.set(userId, [client, ...clients]);

    res.status(201).json({ client });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateClient = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const id = String(req.params.id);
    const { name, email, phone, company, location, website, notes, projects, totalSpent, rating } = req.body;

    const clients = clientStore.get(userId) || [];
    const idx = clients.findIndex((c) => c.id === id);
    const existing = idx >= 0 ? clients[idx] : null;

    if (!existing) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const client = {
      ...existing,
      name,
      email,
      phone,
      company,
      location,
      website,
      notes,
      projects,
      totalSpent,
      rating,
    } as ClientRecord;

    clients[idx] = client;
    clientStore.set(userId, clients);

    res.json({ client });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const id = String(req.params.id);

    const clients = clientStore.get(userId) || [];
    const existing = clients.find((c) => c.id === id);

    if (!existing) {
      return res.status(404).json({ message: 'Client not found' });
    }

    clientStore.set(
      userId,
      clients.filter((c) => c.id !== id)
    );

    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
