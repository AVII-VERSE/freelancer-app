import { Request, Response } from 'express';
import { groq } from '../lib/openai';
import { prisma } from '../lib/prisma';

export const analyzeProject = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { title, description, clientCountry } = req.body;

    if (!description) {
      return res.status(400).json({ message: 'Project description is required' });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    const skills = profile?.skills?.join(', ') || 'Not specified';
    const hourlyRate = profile?.hourlyRate || 25;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an expert freelance consultant and proposal strategist. Analyze the given project and return ONLY a valid JSON object with no extra text.`,
        },
        {
          role: 'user',
          content: `
            Analyze this freelance project and return a JSON object:

            Project Title: ${title || 'Not provided'}
            Project Description: ${description}
            Client Country: ${clientCountry || 'Not specified'}
            My Skills: ${skills}
            My Hourly Rate: $${hourlyRate}/hr

            Return this exact JSON structure:
            {
              "recommended_structure": ["section1", "section2"],
              "bidding_strategy": "fixed or hourly or milestone",
              "effort_level": "low or medium or high",
              "hours_estimate": 0,
              "tech_fit_score": 0,
              "matched_skills": ["skill1"],
              "bid_range": { "min": 0, "max": 0 },
              "red_flags": ["flag1"],
              "winning_angle": "your best unique selling point"
            }
          `,
        },
      ],
    });

    const raw = completion.choices[0].message.content || '{}';
    const clean = raw.replace(/```json|```/g, '').trim();
    const analysis = JSON.parse(clean);

    res.json({ analysis });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'AI analysis failed' });
  }
};

export const generateProposal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { projectDescription, templateInstructions, templateExample } = req.body;

    if (!projectDescription) {
      return res.status(400).json({ message: 'Project description is required' });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: templateInstructions 
            ? `You are an expert freelance proposal writer. Follow these instructions when writing: ${templateInstructions}`
            : `You are an expert freelance proposal writer. Write compelling, personalized proposals that win projects. Return ONLY the proposal text.`,
        },
        {
          role: 'user',
          content: `
            Write a winning freelance proposal for this project:

            Project Description: ${projectDescription}
            
            ${templateExample ? `Follow this example structure/style:\n${templateExample}` : ''}

            Write a professional, concise and compelling proposal.
          `,
        },
      ],
    });

    const proposal = completion.choices[0].message.content || '';

    res.json({ proposal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Proposal generation failed' });
  }
};