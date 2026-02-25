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
    const { projectDescription, templateId } = req.body;

    if (!projectDescription) {
      return res.status(400).json({ message: 'Project description is required' });
    }

    let templateContent = null;
    if (templateId) {
      const template = await prisma.template.findFirst({
        where: { id: templateId, userId },
      });
      templateContent = template?.content;
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an expert freelance proposal writer. Write compelling, personalized proposals that win projects. Return ONLY the proposal text.`,
        },
        {
          role: 'user',
          content: `
            Write a winning freelance proposal for this project:

            Project Description: ${projectDescription}
            ${templateContent ? `Use this structure: ${JSON.stringify(templateContent)}` : ''}

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

export const findTimezone = async (req: Request, res: Response) => {
  try {
    const { country } = req.body;

    if (!country) {
      return res.status(400).json({ message: 'Country name is required' });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a timezone expert. For a given country or city name, return ONLY a valid JSON object with the timezone information.`,
        },
        {
          role: 'user',
          content: `
Find timezone for: ${country}

Return this exact JSON structure:
{
  "name": "Country/City name",
  "timezone": "IANA timezone (e.g., America/New_York)",
  "offset": numeric UTC offset (e.g., -5 or 5.5),
  "flag": "country emoji flag"
}
`,
        },
      ],
    });

    const raw = completion.choices[0].message.content || '{}';
    const clean = raw.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to find timezone' });
  }
};