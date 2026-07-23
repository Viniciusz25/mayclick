import express from 'express';
import { 
  getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
  getPortfolioCategories, createPortfolioCategory, updatePortfolioCategory, deletePortfolioCategory,
  reorderCategories,
  getPortfolioPhotos, createPortfolioPhoto, updatePortfolioPhoto, deletePortfolioPhoto, reorderPortfolioPhotos,
  getHomeHighlights, createHomeHighlight, updateHomeHighlight, deleteHomeHighlight
} from '../controllers/homepage.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

// Testimonials
router.get('/testimonials', getTestimonials);
router.post('/testimonials', createTestimonial);
router.put('/testimonials/:id', updateTestimonial);
router.delete('/testimonials/:id', deleteTestimonial);

// Categories
router.get('/categories', getPortfolioCategories);
router.post('/categories', createPortfolioCategory);
router.patch('/categories/reorder', reorderCategories);
router.put('/categories/:id', updatePortfolioCategory);
router.delete('/categories/:id', deletePortfolioCategory);

// Photos
router.get('/photos', getPortfolioPhotos);
router.post('/photos', createPortfolioPhoto);
router.patch('/photos/reorder', reorderPortfolioPhotos);
router.put('/photos/:id', updatePortfolioPhoto);
router.delete('/photos/:id', deletePortfolioPhoto);

// Highlights
router.get('/highlights', getHomeHighlights);
router.post('/highlights', createHomeHighlight);
router.put('/highlights/:id', updateHomeHighlight);
router.delete('/highlights/:id', deleteHomeHighlight);

export default router;
