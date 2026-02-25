import { Router } from 'express';
import { analyzeProject, generateProposal, findTimezone } from '../controllers/ai.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/analyze', protect, analyzeProject);
router.post('/generate', protect, generateProposal);
router.post('/find-timezone', protect, findTimezone);

export default router;