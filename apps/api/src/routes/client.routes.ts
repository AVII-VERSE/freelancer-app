import { Router } from 'express';
import { getClients, createClient, updateClient, deleteClient } from '../controllers/client.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', protect, getClients);
router.post('/', protect, createClient);
router.put('/:id', protect, updateClient);
router.delete('/:id', protect, deleteClient);

export default router;
