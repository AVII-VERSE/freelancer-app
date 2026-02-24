import { Router } from 'express';
import { getAlerts, createAlert, updateAlert, deleteAlert } from '../controllers/timezone.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', protect, getAlerts);
router.post('/', protect, createAlert);
router.put('/:id', protect, updateAlert);
router.delete('/:id', protect, deleteAlert);

export default router;
