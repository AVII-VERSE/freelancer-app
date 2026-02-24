import { Router } from 'express';
import {
  createTemplate,
  getTemplates,
  getTemplate,
  updateTemplate,
  deleteTemplate,
} from '../controllers/template.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/', protect, createTemplate);
router.get('/', protect, getTemplates);
router.get('/:id', protect, getTemplate);
router.put('/:id', protect, updateTemplate);
router.delete('/:id', protect, deleteTemplate);

export default router;