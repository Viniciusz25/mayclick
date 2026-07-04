import express from 'express';
import { 
  getBlogPosts, getBlogPost, incrementViews, likePost, 
  createBlogPost, updateBlogPost, deleteBlogPost 
} from '../controllers/blog.controller.js';

const router = express.Router();

router.get('/', getBlogPosts);
router.post('/', createBlogPost);
router.put('/:id', updateBlogPost);
router.delete('/:id', deleteBlogPost);
router.get('/:slug', getBlogPost);
router.post('/:slug/views', incrementViews);
router.post('/:slug/like', likePost);

export default router;
