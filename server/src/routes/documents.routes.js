import express from 'express';
import multer from 'multer';
import { saveDocument, listDocuments, downloadDocument } from '../controllers/documents.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Multer config for memory storage (for Supabase upload)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

router.use(authenticateToken);

router.post('/', upload.single('pdf'), saveDocument);
router.get('/', listDocuments);
router.get('/:id/download', downloadDocument);

export default router;
