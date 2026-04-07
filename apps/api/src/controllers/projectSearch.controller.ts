import { Request, Response } from 'express';

type SearchProject = {
  id: string;
  userId: string;
  searchTerm: string;
  title: string;
  description: string;
  budget: string | null;
  skills: string[];
  clientName: string;
  clientLocation: string | null;
  isIdVerified: boolean;
  isPaymentVerified: boolean;
  isDepositMade: boolean;
  isEmailVerified: boolean;
  isProfileCompleted: boolean;
  isPhoneVerified: boolean;
  memberSince: string | null;
  totalSpent: string | null;
  jobsPosted: number;
  hireRate: string | null;
  rating: number | null;
  reviews: number;
  projectUrl: string | null;
  isViewed: boolean;
  isSaved: boolean;
  createdAt: string;
};

type NotificationItem = {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
};

type AutomationSettings = {
  userId: string;
  isEnabled: boolean;
  selectedTechs: string[];
  intervalMinutes: number;
  lastRunAt: string | null;
};

const projectStore = new Map<string, SearchProject[]>();
const notificationStore = new Map<string, NotificationItem[]>();
const automationStore = new Map<string, AutomationSettings>();

const TECHNOLOGIES = [
  'React', 'React Native', 'Node.js', 'Python', 'JavaScript', 'TypeScript',
  'PHP', 'Laravel', 'WordPress', 'Angular', 'Vue.js', 'Django', 'Flask',
  'Ruby on Rails', 'Java', 'Spring', 'C#', '.NET', 'ASP.NET', 'Go', 'Rust',
  'Swift', 'Kotlin', 'Flutter', 'iOS', 'Android', 'AWS', 'Azure', 'Google Cloud',
  'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'GraphQL',
  'REST API', 'HTML', 'CSS', 'Tailwind', 'Next.js', 'Nuxt.js', 'Svelte',
  'Express.js', 'FastAPI', 'TensorFlow', 'Machine Learning', 'Data Science',
  'Blockchain', 'Solidity', 'ETH', 'NFT', 'Web3', 'Figma', 'UI/UX Design',
  'Photoshop', 'Illustrator', 'Shopify', 'WooCommerce', 'Magento', 'Salesforce',
];

export const getTechnologies = async (_req: Request, res: Response) => {
  res.json({ technologies: TECHNOLOGIES });
};

function generateMockProjects(technology: string, count: number) {
  const clientNames = ['TechCorp Inc.', 'Digital Solutions LLC', 'Innovate Labs', 'StartupXYZ', 'CloudTech Systems', 'DataDriven Co.', 'WebMasters Ltd.', 'AppFactory', 'GlobalTech', 'InnovativeSoft', 'NextGen Apps', 'CodeCrafters', 'DevHouse', 'TechStart'];
  const locations = ['United States', 'United Kingdom', 'Canada', 'Germany', 'Australia', 'Netherlands', 'France', 'India', 'Singapore', 'Japan'];
  const projectTypes = ['E-commerce Website', 'Mobile App Development', 'Web Application', 'API Integration', 'Dashboard Creation', 'Enterprise Software', 'SaaS Platform', 'CMS Implementation', 'Frontend Development', 'Backend Development', 'Full Stack Project', 'Database Design'];
  
  const projects = [];
  for (let i = 0; i < count; i++) {
    const budget = Math.floor(Math.random() * 8000) + 500;
    const projectId = Math.floor(Math.random() * 900000) + 100000;
    
    projects.push({
      id: `proj_${Date.now()}_${i}`,
      title: `${technology} Developer Needed - ${projectTypes[i % projectTypes.length]}`,
      description: `We are looking for an experienced ${technology} developer to build a ${projectTypes[i % projectTypes.length].toLowerCase()}. The ideal candidate should have strong problem-solving skills and be able to work independently. Requirements include proven experience with ${technology}, good communication skills, and ability to meet deadlines.`,
      budget: `$${budget}-${budget + 3000}`,
      skills: [technology, 'JavaScript', 'HTML', 'CSS', 'Git'],
      clientName: clientNames[i % clientNames.length],
      clientLocation: locations[i % locations.length],
      isIdVerified: true,
      isPaymentVerified: true,
      isDepositMade: true,
      isEmailVerified: true,
      isProfileCompleted: true,
      isPhoneVerified: true,
      memberSince: ['Jan 2020', 'Mar 2021', 'Jun 2022', 'Sep 2023', 'Dec 2021', 'Feb 2024'][i % 6],
      totalSpent: `$${(Math.floor(Math.random() * 50) + 10) * 1000}`,
      jobsPosted: Math.floor(Math.random() * 50) + 5,
      hireRate: `${Math.floor(Math.random() * 30) + 50}%`,
      rating: parseFloat((4 + Math.random()).toFixed(1)),
      reviews: Math.floor(Math.random() * 100) + 10,
      projectUrl: `https://www.freelancer.com/projects/${projectId}/`,
      isViewed: false,
      isSaved: false,
      createdAt: new Date().toISOString(),
    });
  }
  return projects;
}

export const searchProjects = async (req: Request, res: Response) => {
  try {
    const { technology, maxResults = 15 } = req.body;

    if (!technology) {
      return res.status(400).json({ message: 'Technology is required' });
    }

    const mockProjects = generateMockProjects(technology, maxResults);
    res.json({ projects: mockProjects, technology, count: mockProjects.length });
  } catch (error) {
    console.error('Project search error:', error);
    res.status(500).json({ message: 'Failed to search projects' });
  }
};

export const getSavedProjects = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const projects = (projectStore.get(userId) || []).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
    res.json({ projects });
  } catch (error) {
    console.error('Error fetching saved projects:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
};

export const saveProject = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { projectId } = req.body;

    const projects = projectStore.get(userId) || [];
    const idx = projects.findIndex((p) => p.id === projectId);
    if (idx < 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    projects[idx] = { ...projects[idx], isSaved: true };
    projectStore.set(userId, projects);

    const project = projects[idx];
    res.json({ project });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save project' });
  }
};

export const markProjectViewed = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { projectId } = req.body;

    const projects = projectStore.get(userId) || [];
    const idx = projects.findIndex((p) => p.id === projectId);
    if (idx < 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    projects[idx] = { ...projects[idx], isViewed: true };
    projectStore.set(userId, projects);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark project' });
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const notifications = (notificationStore.get(userId) || [])
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 50);
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { notificationId } = req.body;

    const notifications = notificationStore.get(userId) || [];
    const idx = notifications.findIndex((n) => n.id === notificationId);
    if (idx >= 0) {
      notifications[idx] = { ...notifications[idx], isRead: true };
      notificationStore.set(userId, notifications);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark notification' });
  }
};

export const markAllNotificationsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const notifications = (notificationStore.get(userId) || []).map((n) => ({
      ...n,
      isRead: true,
    }));
    notificationStore.set(userId, notifications);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark notifications' });
  }
};

export const getAutomationSettings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    let settings = automationStore.get(userId);
    
    if (!settings) {
      settings = { userId, isEnabled: false, selectedTechs: [], intervalMinutes: 15, lastRunAt: null };
      automationStore.set(userId, settings);
    }
    
    res.json({ settings });
  } catch (error: any) {
    console.error('Error getting automation:', error);
    res.status(500).json({ message: error.message || 'Failed to get automation settings' });
  }
};

export const updateAutomationSettings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { isEnabled, selectedTechs, intervalMinutes } = req.body;
    
    const settings: AutomationSettings = {
      userId,
      isEnabled: Boolean(isEnabled),
      selectedTechs: Array.isArray(selectedTechs) ? selectedTechs : [],
      intervalMinutes: Number(intervalMinutes) || 15,
      lastRunAt: automationStore.get(userId)?.lastRunAt || null,
    };
    automationStore.set(userId, settings);
    
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update automation settings' });
  }
};

export const runAutomation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const settings = automationStore.get(userId);
    
    if (!settings || !settings.isEnabled || settings.selectedTechs.length === 0) {
      return res.status(400).json({ message: 'Automation not configured or disabled' });
    }
    
    const allProjects: any[] = [];
    
    for (const tech of settings.selectedTechs) {
      const mockProjects = generateMockProjects(tech, 5);
      for (const project of mockProjects) {
        const savedProject: SearchProject = { userId, searchTerm: tech, ...project };
        allProjects.push(savedProject);
      }
    }

    projectStore.set(userId, [...allProjects, ...(projectStore.get(userId) || [])]);

    automationStore.set(userId, {
      ...settings,
      lastRunAt: new Date().toISOString(),
    });
    
    if (allProjects.length > 0) {
      const notifications = notificationStore.get(userId) || [];
      notifications.unshift({
        id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        userId,
        type: 'automation_run',
        title: 'Automation Complete',
        message: `Found ${allProjects.length} new projects`,
        link: '/project-search',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      notificationStore.set(userId, notifications);
    }
    
    res.json({ success: true, projectsFound: allProjects.length });
  } catch (error) {
    res.status(500).json({ message: 'Automation failed' });
  }
};
