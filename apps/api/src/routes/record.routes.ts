import { Router } from 'express';
import { createRecord, getRecords, getRecord, getAnalytics, getProposalActivity } from '../controllers/record.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/', protect, createRecord);
router.get('/', protect, getRecords);
router.get('/analytics', protect, getAnalytics);
router.get('/activity', protect, getProposalActivity);
router.get('/:id', protect, getRecord);

export default router;