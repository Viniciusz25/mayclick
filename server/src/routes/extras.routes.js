import express from 'express';
import { getAllExtras, createExtra, updateExtra, deleteExtra } from '../controllers/extras.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAllExtras);
router.post('/', createExtra);
router.put('/:id', updateExtra);
router.delete('/:id', deleteExtra);

export default router;
