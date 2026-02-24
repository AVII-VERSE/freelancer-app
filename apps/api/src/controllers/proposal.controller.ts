import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const createProposal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { title, content, bidAmount } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    // 7 days expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const proposal = await prisma.proposal.create({
      data: { userId, title, content, bidAmount, expiresAt },
    });

    res.status(201).json({ message: 'Proposal created successfully', proposal });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProposals = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { status } = req.query;

    const proposals = await prisma.proposal.findMany({
      where: {
        userId,
        ...(status && { status: String(status) }),
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ proposals });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProposal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const proposal = await prisma.proposal.findFirst({
      where: { id, userId },
      include: { record: true },
    });

    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    res.json({ proposal });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProposalStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'won', 'lost', 'no_response'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const existing = await prisma.proposal.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    const proposal = await prisma.proposal.update({
      where: { id },
      data: { status },
    });

    res.json({ message: 'Status updated successfully', proposal });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteProposal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const existing = await prisma.proposal.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    await prisma.proposal.delete({ where: { id } });

    res.json({ message: 'Proposal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const cloneProposal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const existing = await prisma.proposal.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const proposal = await prisma.proposal.create({
      data: {
        userId,
        title: `${existing.title} (Copy)`,
        content: existing.content,
        bidAmount: existing.bidAmount,
        expiresAt,
      },
    });

    res.status(201).json({ message: 'Proposal cloned successfully', proposal });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};