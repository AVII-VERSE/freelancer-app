import { Router } from 'express';
import { getQuickTemplates, createQuickTemplate, updateQuickTemplate, deleteQuickTemplate } from '../controllers/quickTemplate.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', protect, getQuickTemplates);
router.post('/', protect, createQuickTemplate);
router.put('/:id', protect, updateQuickTemplate);
router.delete('/:id', protect, deleteQuickTemplate);

export default router;
