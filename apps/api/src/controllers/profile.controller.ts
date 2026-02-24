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

export const getProfileCompletion = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let completed = 0;
    const total = 6;

    if (user.name) completed++;
    if (user.timezone) completed++;
    if (user.profile?.bio) completed++;
    if (user.profile?.skills && user.profile.skills.length > 0) completed++;
    if (user.profile?.experience) completed++;
    if (user.profile?.hourlyRate) completed++;

    const percentage = Math.round((completed / total) * 100);

    res.json({
      profileCompletion: {
        percentage,
        completed,
        total,
        fields: {
          name: !!user.name,
          timezone: !!user.timezone,
          bio: !!user.profile?.bio,
          skills: !!(user.profile?.skills && user.profile.skills.length > 0),
          experience: !!user.profile?.experience,
          hourlyRate: !!user.profile?.hourlyRate,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
