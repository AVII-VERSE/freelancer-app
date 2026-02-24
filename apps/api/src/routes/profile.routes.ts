import { Router } from 'express';
import { getProfile, updateProfile, updateUser, getProfileCompletion } from '../controllers/profile.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.put('/user', protect, updateUser);
router.get('/completion', protect, getProfileCompletion);

export default router;
