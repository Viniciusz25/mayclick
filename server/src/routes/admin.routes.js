import express from 'express';
import { getAllSubmissions, getSubmissionById, deleteSubmission, updateSubmission } from '../controllers/submissions.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/submissions', getAllSubmissions);
router.get('/submissions/:id', getSubmissionById);
router.delete('/submissions/:id', deleteSubmission);
router.put('/submissions/:id', updateSubmission);

export default router;
