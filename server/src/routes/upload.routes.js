import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `img-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Use JPG, PNG, WEBP ou GIF.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
});

const buildFileUrl = (filename) => {
  const port = process.env.PORT || 4001;
  const host = process.env.HOST || 'localhost';
  const baseUrl = process.env.NODE_ENV === 'production'
    ? (process.env.APP_PUBLIC_URL || '')
    : `http://${host}:${port}`;
  return `${baseUrl}/uploads/${filename}`;
};

// POST /api/admin/upload  (single image)
router.post('/', authenticateToken, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }
  res.json({ url: buildFileUrl(req.file.filename), filename: req.file.filename });
});

// POST /api/admin/upload/bulk  (up to 50 images at once)
router.post('/bulk', authenticateToken, upload.array('images', 50), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }
  const results = req.files.map((f) => ({
    url: buildFileUrl(f.filename),
    filename: f.filename,
    originalName: f.originalname,
  }));
  res.json({ uploaded: results, count: results.length });
});

export default router;
