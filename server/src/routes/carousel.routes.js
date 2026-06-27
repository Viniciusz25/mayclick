import express from 'express';
import {
  getCarouselSlides, createCarouselSlide,
  updateCarouselSlide, deleteCarouselSlide
} from '../controllers/carousel.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getCarouselSlides);
router.post('/', createCarouselSlide);
router.put('/:id', updateCarouselSlide);
router.delete('/:id', deleteCarouselSlide);

export default router;
