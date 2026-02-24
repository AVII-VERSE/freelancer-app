import { Router } from 'express';
import { signup, login, getMe } from '../controllers/auth.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;