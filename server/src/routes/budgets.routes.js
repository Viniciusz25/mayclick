import express from 'express';
import {
  getAllBudgets, getBudgetById, createBudget, updateBudget, getBudgetsStats
} from '../controllers/budgets.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAllBudgets);
router.get('/stats', getBudgetsStats);
router.get('/:id', getBudgetById);
router.post('/', createBudget);
router.put('/:id', updateBudget);

export default router;
