import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const createTemplate = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name, category, strategy, content } = req.body;

    if (!name || !content) {
      return res.status(400).json({ message: 'Name and content are required' });
    }

    const template = await prisma.template.create({
      data: { userId, name, category, strategy, content },
    });

    res.status(201).json({ message: 'Template created successfully', template });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTemplates = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { category, strategy } = req.query;

    const templates = await prisma.template.findMany({
      where: {
        userId,
        ...(category && { category: String(category) }),
        ...(strategy && { strategy: String(strategy) }),
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ templates });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTemplate = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const template = await prisma.template.findFirst({
      where: { id, userId },
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json({ template });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { name, category, strategy, content } = req.body;

    const existing = await prisma.template.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const template = await prisma.template.update({
      where: { id },
      data: { name, category, strategy, content },
    });

    res.json({ message: 'Template updated successfully', template });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const existing = await prisma.template.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Template not found' });
    }

    await prisma.template.delete({ where: { id } });

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
