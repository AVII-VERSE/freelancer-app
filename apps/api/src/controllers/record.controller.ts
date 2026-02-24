import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const createRecord = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { proposalId, title, description, clientCountry, timezone, techStack, bidAmount } = req.body;

    if (!proposalId || !title) {
      return res.status(400).json({ message: 'Proposal ID and title are required' });
    }

    const proposal = await prisma.proposal.findFirst({
      where: { id: proposalId, userId },
    });

    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    const record = await prisma.projectRecord.create({
      data: { userId, proposalId, title, description, clientCountry, timezone, techStack, bidAmount },
    });

    res.status(201).json({ message: 'Record created successfully', record });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getRecords = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const records = await prisma.projectRecord.findMany({
      where: { userId },
      include: { proposal: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ records });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getRecord = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const record = await prisma.projectRecord.findFirst({
      where: { id, userId },
      include: { proposal: true },
    });

    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json({ record });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const totalProposals = await prisma.proposal.count({ where: { userId } });
    const wonProposals = await prisma.proposal.count({ where: { userId, status: 'won' } });
    const lostProposals = await prisma.proposal.count({ where: { userId, status: 'lost' } });
    const pendingProposals = await prisma.proposal.count({ where: { userId, status: 'pending' } });

    const successRate = totalProposals > 0 ? ((wonProposals / totalProposals) * 100).toFixed(1) : '0';

    const topTechStack = await prisma.projectRecord.findMany({
      where: { userId },
      select: { techStack: true },
    });

    const techCount: Record<string, number> = {};
    topTechStack.forEach((r) => {
      r.techStack.forEach((tech) => {
        techCount[tech] = (techCount[tech] || 0) + 1;
      });
    });

    res.json({
      analytics: {
        totalProposals,
        wonProposals,
        lostProposals,
        pendingProposals,
        successRate: `${successRate}%`,
        techStackUsage: techCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};