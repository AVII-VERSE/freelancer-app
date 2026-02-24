import { Router } from 'express';
import {
  createTemplate,
  getTemplates,
  getTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
} from '../controllers/template.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/', protect, createTemplate);
router.get('/', protect, getTemplates);
router.get('/:id', protect, getTemplate);
router.put('/:id', protect, updateTemplate);
router.delete('/:id', protect, deleteTemplate);
router.post('/:id/duplicate', protect, duplicateTemplate);

export default router;