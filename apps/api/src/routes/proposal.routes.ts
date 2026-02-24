import { Router } from 'express';
import {
  createProposal,
  getProposals,
  getProposal,
  updateProposalStatus,
  deleteProposal,
} from '../controllers/proposal.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/', protect, createProposal);
router.get('/', protect, getProposals);
router.get('/:id', protect, getProposal);
router.put('/:id/status', protect, updateProposalStatus);
router.delete('/:id', protect, deleteProposal);

export default router;