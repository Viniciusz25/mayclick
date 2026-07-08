import { Router } from 'express';
import { getEvents } from '../controllers/calendar.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Endpoint protegido para ler eventos do google calendar
router.get('/events', authenticateToken, getEvents);

export default router;
