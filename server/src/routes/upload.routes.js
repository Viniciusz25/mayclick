import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

const storage = multer.memoryStorage();

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

const uploadToSupabase = async (file) => {
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const ext = path.extname(file.originalname).toLowerCase();
  const filename = `img-${uniqueSuffix}${ext}`;

  const { data, error } = await supabase
    .storage
    .from('media')
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) {
    throw error;
  }

  // Get public URL
  const { data: publicData } = supabase.storage.from('media').getPublicUrl(filename);
  
  return {
    url: publicData.publicUrl,
    filename: filename
  };
};

// POST /api/admin/upload  (single image)
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }

  try {
    const result = await uploadToSupabase(req.file);
    res.json({ url: result.url, filename: result.filename });
  } catch (error) {
    console.error('Error uploading to Supabase:', error);
    res.status(500).json({ error: 'Erro ao salvar a imagem na nuvem.' });
  }
});

// POST /api/admin/upload/bulk  (up to 50 images at once)
router.post('/bulk', authenticateToken, upload.array('images', 50), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }

  try {
    const uploadPromises = req.files.map(f => uploadToSupabase(f).then(result => ({
      url: result.url,
      filename: result.filename,
      originalName: f.originalname,
    })));
    
    const results = await Promise.all(uploadPromises);
    res.json({ uploaded: results, count: results.length });
  } catch (error) {
    console.error('Error uploading bulk to Supabase:', error);
    res.status(500).json({ error: 'Erro ao salvar imagens na nuvem.' });
  }
});

export default router;
