import { Router } from 'express';
import { getProfile, updateProfile, updateUser } from '../controllers/profile.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.put('/user', protect, updateUser);

export default router;
