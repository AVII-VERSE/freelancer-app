import { Router } from 'express';
import { getMeetings, createMeeting, updateMeeting, deleteMeeting } from '../controllers/meeting.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', protect, getMeetings);
router.post('/', protect, createMeeting);
router.put('/:id', protect, updateMeeting);
router.delete('/:id', protect, deleteMeeting);

export default router;
