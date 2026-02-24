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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    const skills = user?.profile?.skills?.join(', ') || 'Not specified';
    const hourlyRate = user?.profile?.hourlyRate || 25;
    const userName = user?.name || 'Freelancer';

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
Analyze this freelance project for ${userName} and return a JSON object:

Project Title: ${title || 'Not provided'}
Project Description: ${description}
Client Country: ${clientCountry || 'Not specified'}
Freelancer Name: ${userName}
Freelancer Skills: ${skills}
Freelancer Hourly Rate: $${hourlyRate}/hr

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
    const { projectDescription, templateInstructions, templateExample, projectTitle } = req.body;

    if (!projectDescription) {
      return res.status(400).json({ message: 'Project description is required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    const userName = user?.name || 'Freelancer';
    const userSkills = user?.profile?.skills?.join(', ') || 'various technologies';
    const userExperience = user?.profile?.experience || 'relevant field';
    const userBio = user?.profile?.bio || '';
    const userHourlyRate = user?.profile?.hourlyRate || 50;
    const platforms = user?.profile?.platforms?.join(', ') || 'freelance platforms';

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: templateInstructions 
            ? `You are an expert freelance proposal writer. Follow these instructions when writing proposals. ${templateInstructions}`
            : `You are an expert freelance proposal writer. Write compelling, personalized proposals that win projects.`,
        },
        {
          role: 'user',
          content: `
Write a winning freelance proposal for this project:

Project Title: ${projectTitle || 'Not specified'}
Project Description: ${projectDescription}

=== ABOUT THE FREELANCER ===
Name: ${userName}
Skills: ${userSkills}
Experience: ${userExperience}
Bio: ${userBio}
Hourly Rate: $${userHourlyRate}/hr
Preferred Platforms: ${platforms}

${templateExample ? `\n=== EXAMPLE TO FOLLOW ===\n${templateExample}\n` : ''}

Write a professional, personalized proposal that:
- Uses the freelancer's name: ${userName}
- Highlights relevant skills: ${userSkills}
- Shows understanding of the project
- Includes relevant experience
- Is compelling and concise

The proposal should be ready to send - no placeholders or defaults.
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