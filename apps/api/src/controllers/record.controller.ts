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
    const id = String(req.params.id);

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

export const updateRecord = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const id = String(req.params.id);
    const { title, description, clientCountry, timezone, techStack, bidAmount } = req.body;

    const existing = await prisma.projectRecord.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Record not found' });
    }

    const record = await prisma.projectRecord.update({
      where: { id },
      data: {
        title,
        description,
        clientCountry,
        timezone,
        techStack,
        bidAmount,
      },
    });

    res.json({ message: 'Record updated successfully', record });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteRecord = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const id = String(req.params.id);

    const existing = await prisma.projectRecord.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Record not found' });
    }

    await prisma.projectRecord.delete({ where: { id } });

    res.json({ message: 'Record deleted successfully' });
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
    const winRate = (wonProposals + lostProposals) > 0 ? ((wonProposals / (wonProposals + lostProposals)) * 100).toFixed(1) : '0';

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

    const wonProjectRecords = await prisma.projectRecord.findMany({
      where: { userId, proposal: { status: 'won' } },
      select: { bidAmount: true },
    });
    const totalEarnings = wonProjectRecords.reduce((sum, r) => sum + (r.bidAmount || 0), 0);

    const totalTemplates = await prisma.template.count({ where: { userId } });

    res.json({
      analytics: {
        totalProposals,
        wonProposals,
        lostProposals,
        pendingProposals,
        successRate: `${successRate}%`,
        winRate: `${winRate}%`,
        totalEarnings,
        totalTemplates,
        techStackUsage: techCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};