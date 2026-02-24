import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    res.json({ profile });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { bio, skills, experience, hourlyRate, platforms } = req.body;

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: { bio, skills, experience, hourlyRate, platforms },
      create: { userId, bio, skills, experience, hourlyRate, platforms },
    });

    res.json({ message: 'Profile updated successfully', profile });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name, timezone } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, timezone },
    });

    res.json({
      message: 'User updated successfully',
      user: { id: user.id, email: user.email, name: user.name, timezone: user.timezone },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
