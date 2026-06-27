import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';

import authRoutes from './routes/auth.routes.js';
import publicRoutes from './routes/public.routes.js';
import adminRoutes from './routes/admin.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import packagesRoutes from './routes/packages.routes.js';
import extrasRoutes from './routes/extras.routes.js';
import documentsRoutes from './routes/documents.routes.js';
import budgetsRoutes from './routes/budgets.routes.js';
import homepageRoutes from './routes/homepage.routes.js';
import uploadRoutes from './routes/upload.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const productionOrigins = [
  'https://mayclickfotos.com.br',
  'https://www.mayclickfotos.com.br',
  'https://mayclick.com.br',
  'https://www.mayclick.com.br',
];
const developmentOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];
const envOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
  .filter((origin) => (
    process.env.NODE_ENV !== 'production'
      || (!origin.includes('localhost') && !origin.includes('127.0.0.1'))
  ));
const defaultOrigins = process.env.NODE_ENV === 'production'
  ? productionOrigins
  : [...productionOrigins, ...developmentOrigins];
const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];
const genericErrorMessage = 'Erro interno ao processar a solicitação.';

const sanitizeError = (err) => ({
  message: err.message,
  code: err.code,
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow images from /uploads to be loaded cross-origin
}));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    const corsError = new Error('CORS origin not allowed.');
    corsError.status = 403;
    return callback(corsError);
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    console.log(`[API] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'mayclick-api' }));

app.get('/api/health/db', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, database: 'ok' });
  } catch (error) {
    console.error('[HEALTH_DB_ERROR]', sanitizeError(error));
    res.status(503).json({ ok: false, database: 'unavailable' });
  }
});

// Serve uploaded images as static files
app.use('/uploads', express.static(path.resolve('uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/admin/packages', packagesRoutes);
app.use('/api/admin/extras', extrasRoutes);
app.use('/api/admin/documents', documentsRoutes);
app.use('/api/admin/budgets', budgetsRoutes);
app.use('/api/admin/homepage', homepageRoutes);
app.use('/api/admin/upload', uploadRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  console.error('[API_ERROR]', {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    error: sanitizeError(err),
  });

  const isProduction = process.env.NODE_ENV === 'production';
  const responseMessage = isProduction
    ? genericErrorMessage
    : err.message || genericErrorMessage;

  res.status(statusCode).json({
    error: responseMessage,
  });
});

export default app;
