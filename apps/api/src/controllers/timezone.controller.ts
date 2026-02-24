import { Router } from 'express';
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { protect } from '../middleware/auth';

export const getAlerts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const alerts = await prisma.timezoneAlert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ alerts });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createAlert = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name, timezone, alertTime } = req.body;

    if (!name || !timezone || !alertTime) {
      return res.status(400).json({ message: 'Name, timezone and alertTime are required' });
    }

    const alert = await prisma.timezoneAlert.create({
      data: { userId, name, timezone, alertTime },
    });

    res.status(201).json({ message: 'Alert created', alert });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateAlert = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { name, timezone, alertTime, enabled } = req.body;

    const existing = await prisma.timezoneAlert.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    const alert = await prisma.timezoneAlert.update({
      where: { id },
      data: { name, timezone, alertTime, enabled },
    });

    res.json({ message: 'Alert updated', alert });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteAlert = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const existing = await prisma.timezoneAlert.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    await prisma.timezoneAlert.delete({ where: { id } });

    res.json({ message: 'Alert deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
