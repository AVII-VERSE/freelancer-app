import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  getTechnologies,
  searchProjects,
  getSavedProjects,
  saveProject,
  markProjectViewed,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getAutomationSettings,
  updateAutomationSettings,
  runAutomation,
} from '../controllers/projectSearch.controller';

const router = Router();

router.get('/technologies', getTechnologies);
router.post('/search', protect, searchProjects);
router.get('/saved', protect, getSavedProjects);
router.post('/save', protect, saveProject);
router.post('/view', protect, markProjectViewed);
router.get('/notifications', protect, getNotifications);
router.post('/notifications/read', protect, markNotificationRead);
router.post('/notifications/read-all', protect, markAllNotificationsRead);
router.get('/automation', protect, getAutomationSettings);
router.post('/automation', protect, updateAutomationSettings);
router.post('/automation/run', protect, runAutomation);

export default router;
