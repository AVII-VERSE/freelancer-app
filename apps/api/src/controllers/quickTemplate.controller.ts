import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getQuickTemplates = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const templates = await prisma.quickTemplate.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ templates });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createQuickTemplate = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name, content, category } = req.body;

    if (!name || !content) {
      return res.status(400).json({ message: 'Name and content are required' });
    }

    const template = await prisma.quickTemplate.create({
      data: { userId, name, content, category: category || 'other' },
    });

    res.status(201).json({ template });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateQuickTemplate = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { name, content, category } = req.body;

    const existing = await prisma.quickTemplate.findFirst({
      where: { id: String(id), userId },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const template = await prisma.quickTemplate.update({
      where: { id: String(id) },
      data: { name, content, category },
    });

    res.json({ template });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteQuickTemplate = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const existing = await prisma.quickTemplate.findFirst({
      where: { id: String(id), userId },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Template not found' });
    }

    await prisma.quickTemplate.delete({ where: { id: String(id) } });

    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
