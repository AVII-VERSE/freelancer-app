import { Router } from 'express';
import { createRecord, getRecords, getRecord, getAnalytics, updateRecord, deleteRecord } from '../controllers/record.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/', protect, createRecord);
router.get('/', protect, getRecords);
router.get('/analytics', protect, getAnalytics);
router.put('/:id', protect, updateRecord);
router.delete('/:id', protect, deleteRecord);
router.get('/:id', protect, getRecord);

export default router;