import { Router } from 'express';
import { analyzeProject, generateProposal } from '../controllers/ai.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/analyze', protect, analyzeProject);
router.post('/generate', protect, generateProposal);

export default router;