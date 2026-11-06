import jwt from 'jsonwebtoken';
import path from 'path';
import pool, { dbContext, createRequestPool } from '../../server/src/db.js';
import { supabase } from '../../server/src/lib/supabase.js';

import { login } from '../../server/src/controllers/auth.controller.js';
import {
  createSubmission,
  getAllSubmissions,
  getSubmissionById,
  deleteSubmission,
  updateSubmission,
} from '../../server/src/controllers/submissions.controller.js';
import {
  getPublicPackages,
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  togglePackageActive,
} from '../../server/src/controllers/packages.controller.js';
import {
  getPublicExtras,
  getAllExtras,
  createExtra,
  updateExtra,
  deleteExtra,
} from '../../server/src/controllers/extras.controller.js';
import {
  getPublicHomeData,
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getPortfolioCategories,
  createPortfolioCategory,
  updatePortfolioCategory,
  deletePortfolioCategory,
  reorderCategories,
  getPortfolioPhotos,
  createPortfolioPhoto,
  updatePortfolioPhoto,
  deletePortfolioPhoto,
  reorderPortfolioPhotos,
  getPortfolioAlbums,
  createPortfolioAlbum,
  updatePortfolioAlbum,
  deletePortfolioAlbum,
  reorderPortfolioAlbums,
  getHomeHighlights,
  createHomeHighlight,
  updateHomeHighlight,
  deleteHomeHighlight,
} from '../../server/src/controllers/homepage.controller.js';
import {
  getPublicCarouselSlides,
  getCarouselSlides,
  createCarouselSlide,
  updateCarouselSlide,
  deleteCarouselSlide,
} from '../../server/src/controllers/carousel.controller.js';
import { getSettings, updateSettings } from '../../server/src/controllers/settings.controller.js';
import {
  saveDocument,
  listDocuments,
  downloadDocument,
} from '../../server/src/controllers/documents.controller.js';
import {
  getAllBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  getBudgetsStats,
} from '../../server/src/controllers/budgets.controller.js';
import {
  getBlogPosts,
  getBlogPost,
  incrementViews,
  likePost,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from '../../server/src/controllers/blog.controller.js';
import { getEvents } from '../../server/src/controllers/calendar.controller.js';

// Public portfolio handlers (mirrored from server/src/routes/public.routes.js)
const getPublicPortfolio = async (req, res) => {
  try {
    const cats = await pool.query(
      'SELECT * FROM portfolio_categories WHERE active = TRUE AND (is_hidden_from_portfolio = FALSE OR is_hidden_from_portfolio IS NULL) ORDER BY sort_order ASC, created_at DESC'
    );
    const catIds = cats.rows.map((c) => c.id);
    const photoCounts = {};
    if (catIds.length > 0) {
      const counts = await pool.query(
        `SELECT category_id, COUNT(*) as count FROM portfolio_photos
         WHERE active = TRUE AND category_id = ANY($1) GROUP BY category_id`,
        [catIds]
      );
      counts.rows.forEach((r) => {
        photoCounts[r.category_id] = parseInt(r.count, 10);
      });
    }
    const result = cats.rows.map((c) => ({ ...c, photo_count: photoCounts[c.id] || 0 }));
    res.json(result);
  } catch (err) {
    console.error('[PUBLIC /portfolio]', err.message);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const getPublicPortfolioBySlug = async (req, res) => {
  try {
    const catResult = await pool.query(
      'SELECT * FROM portfolio_categories WHERE slug = $1 AND active = TRUE LIMIT 1',
      [req.params.slug]
    );
    if (catResult.rowCount === 0) return res.status(404).json({ message: 'Categoria não encontrada.' });
    const category = catResult.rows[0];

    const photosResult = await pool.query(
      `SELECT * FROM portfolio_photos
       WHERE category_id = $1 AND album_id IS NULL AND active = TRUE
       ORDER BY sort_order ASC, created_at DESC`,
      [category.id]
    );

    const albumsResult = await pool.query(
      `SELECT * FROM portfolio_albums
       WHERE category_id = $1 AND active = TRUE
       ORDER BY sort_order ASC, created_at DESC`,
      [category.id]
    );

    const allCats = await pool.query(
      'SELECT id, slug, title FROM portfolio_categories WHERE active = TRUE AND is_hidden_from_portfolio = FALSE ORDER BY sort_order ASC'
    );

    res.json({
      category,
      photos: photosResult.rows,
      albums: albumsResult.rows,
      allCategories: allCats.rows,
    });
  } catch (err) {
    console.error('[PUBLIC /portfolio/:slug]', err.message);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const getPublicPortfolioAlbum = async (req, res) => {
  try {
    const albumResult = await pool.query(
      'SELECT * FROM portfolio_albums WHERE slug = $1 AND active = TRUE LIMIT 1',
      [req.params.albumSlug]
    );
    if (albumResult.rowCount === 0) return res.status(404).json({ message: 'Álbum não encontrado.' });
    const album = albumResult.rows[0];

    const catResult = await pool.query(
      'SELECT * FROM portfolio_categories WHERE id = $1 LIMIT 1',
      [album.category_id]
    );
    const category = catResult.rows[0];

    const photosResult = await pool.query(
      `SELECT * FROM portfolio_photos
       WHERE album_id = $1 AND active = TRUE
       ORDER BY sort_order ASC, created_at DESC`,
      [album.id]
    );

    const allCats = await pool.query(
      'SELECT id, slug, title FROM portfolio_categories WHERE active = TRUE AND is_hidden_from_portfolio = FALSE ORDER BY sort_order ASC'
    );

    res.json({
      album,
      category,
      photos: photosResult.rows,
      allCategories: allCats.rows,
    });
  } catch (err) {
    console.error('[PUBLIC /portfolio/:catSlug/:albumSlug]', err.message);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Upload handlers using Supabase Storage (mirrored from server/src/routes/upload.routes.js)
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

const uploadToSupabase = async (file) => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    const err = new Error('Tipo de arquivo não permitido. Use JPG, PNG, WEBP ou GIF.');
    err.status = 400;
    throw err;
  }

  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const ext = path.extname(file.originalname).toLowerCase();
  const filename = `img-${uniqueSuffix}${ext}`;

  const { error } = await supabase.storage.from('media').upload(filename, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });

  if (error) throw error;

  const { data: publicData } = supabase.storage.from('media').getPublicUrl(filename);
  return {
    url: publicData.publicUrl,
    filename,
  };
};

const handleSingleImageUpload = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }
  try {
    const result = await uploadToSupabase(req.file);
    res.json({ url: result.url, filename: result.filename });
  } catch (error) {
    console.error('Error uploading to Supabase:', error);
    res.status(error.status || 500).json({ error: error.message || 'Erro ao salvar a imagem na nuvem.' });
  }
};

const handleBulkImageUpload = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }
  try {
    const uploadPromises = req.files.map((f) =>
      uploadToSupabase(f).then((result) => ({
        url: result.url,
        filename: result.filename,
        originalName: f.originalname,
      }))
    );
    const results = await Promise.all(uploadPromises);
    res.json({ uploaded: results, count: results.length });
  } catch (error) {
    console.error('Error uploading bulk to Supabase:', error);
    res.status(error.status || 500).json({ error: error.message || 'Erro ao salvar imagens na nuvem.' });
  }
};

// Route definitions: [METHOD, pattern, isProtected, handler]
const ROUTES = [
  // Health
  ['GET', '/api/health', false, (req, res) => res.json({ ok: true, service: 'mayclick-api', runtime: 'cloudflare-pages' })],
  ['GET', '/api/health/db', false, async (req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({ ok: true, database: 'ok' });
    } catch (error) {
      console.error('[HEALTH_DB_ERROR]', error.message);
      res.status(503).json({ ok: false, database: 'unavailable' });
    }
  }],

  // Auth
  ['POST', '/api/auth/login', false, login],

  // Public
  ['POST', '/api/public/submissions', false, createSubmission],
  ['GET', '/api/public/packages', false, getPublicPackages],
  ['GET', '/api/public/extras', false, getPublicExtras],
  ['GET', '/api/public/home-data', false, getPublicHomeData],
  ['GET', '/api/public/carousel', false, getPublicCarouselSlides],
  ['GET', '/api/public/portfolio', false, getPublicPortfolio],
  ['GET', '/api/public/portfolio/:slug', false, getPublicPortfolioBySlug],
  ['GET', '/api/public/portfolio/:catSlug/:albumSlug', false, getPublicPortfolioAlbum],

  // Blog
  ['GET', '/api/blog', false, getBlogPosts],
  ['POST', '/api/blog', true, createBlogPost],
  ['PUT', '/api/blog/:id', true, updateBlogPost],
  ['DELETE', '/api/blog/:id', true, deleteBlogPost],
  ['GET', '/api/blog/:slug', false, getBlogPost],
  ['POST', '/api/blog/:slug/views', false, incrementViews],
  ['POST', '/api/blog/:slug/like', false, likePost],

  // Admin - Submissions
  ['GET', '/api/admin/submissions', true, getAllSubmissions],
  ['GET', '/api/admin/submissions/:id', true, getSubmissionById],
  ['DELETE', '/api/admin/submissions/:id', true, deleteSubmission],
  ['PUT', '/api/admin/submissions/:id', true, updateSubmission],

  // Admin - Settings
  ['GET', '/api/admin/settings', true, getSettings],
  ['PUT', '/api/admin/settings', true, updateSettings],

  // Admin - Packages
  ['GET', '/api/admin/packages', true, getAllPackages],
  ['GET', '/api/admin/packages/:id', true, getPackageById],
  ['POST', '/api/admin/packages', true, createPackage],
  ['PUT', '/api/admin/packages/:id', true, updatePackage],
  ['PATCH', '/api/admin/packages/:id/toggle-active', true, togglePackageActive],
  ['DELETE', '/api/admin/packages/:id', true, deletePackage],

  // Admin - Extras
  ['GET', '/api/admin/extras', true, getAllExtras],
  ['POST', '/api/admin/extras', true, createExtra],
  ['PUT', '/api/admin/extras/:id', true, updateExtra],
  ['DELETE', '/api/admin/extras/:id', true, deleteExtra],

  // Admin - Documents
  ['POST', '/api/admin/documents', true, saveDocument],
  ['GET', '/api/admin/documents', true, listDocuments],
  ['GET', '/api/admin/documents/:id/download', true, downloadDocument],

  // Admin - Budgets
  ['GET', '/api/admin/budgets', true, getAllBudgets],
  ['GET', '/api/admin/budgets/stats', true, getBudgetsStats],
  ['GET', '/api/admin/budgets/:id', true, getBudgetById],
  ['POST', '/api/admin/budgets', true, createBudget],
  ['PUT', '/api/admin/budgets/:id', true, updateBudget],

  // Admin - Homepage
  ['GET', '/api/admin/homepage/testimonials', true, getTestimonials],
  ['POST', '/api/admin/homepage/testimonials', true, createTestimonial],
  ['PUT', '/api/admin/homepage/testimonials/:id', true, updateTestimonial],
  ['DELETE', '/api/admin/homepage/testimonials/:id', true, deleteTestimonial],

  ['GET', '/api/admin/homepage/categories', true, getPortfolioCategories],
  ['POST', '/api/admin/homepage/categories', true, createPortfolioCategory],
  ['PATCH', '/api/admin/homepage/categories/reorder', true, reorderCategories],
  ['PUT', '/api/admin/homepage/categories/:id', true, updatePortfolioCategory],
  ['DELETE', '/api/admin/homepage/categories/:id', true, deletePortfolioCategory],

  ['GET', '/api/admin/homepage/albums', true, getPortfolioAlbums],
  ['POST', '/api/admin/homepage/albums', true, createPortfolioAlbum],
  ['PATCH', '/api/admin/homepage/albums/reorder', true, reorderPortfolioAlbums],
  ['PUT', '/api/admin/homepage/albums/:id', true, updatePortfolioAlbum],
  ['DELETE', '/api/admin/homepage/albums/:id', true, deletePortfolioAlbum],

  ['GET', '/api/admin/homepage/photos', true, getPortfolioPhotos],
  ['POST', '/api/admin/homepage/photos', true, createPortfolioPhoto],
  ['PATCH', '/api/admin/homepage/photos/reorder', true, reorderPortfolioPhotos],
  ['PUT', '/api/admin/homepage/photos/:id', true, updatePortfolioPhoto],
  ['DELETE', '/api/admin/homepage/photos/:id', true, deletePortfolioPhoto],

  ['GET', '/api/admin/homepage/highlights', true, getHomeHighlights],
  ['POST', '/api/admin/homepage/highlights', true, createHomeHighlight],
  ['PUT', '/api/admin/homepage/highlights/:id', true, updateHomeHighlight],
  ['DELETE', '/api/admin/homepage/highlights/:id', true, deleteHomeHighlight],

  // Admin - Upload
  ['POST', '/api/admin/upload', true, handleSingleImageUpload],
  ['POST', '/api/admin/upload/bulk', true, handleBulkImageUpload],

  // Admin - Calendar
  ['GET', '/api/admin/calendar/events', true, getEvents],

  // Admin - Carousel
  ['GET', '/api/admin/carousel', true, getCarouselSlides],
  ['POST', '/api/admin/carousel', true, createCarouselSlide],
  ['PUT', '/api/admin/carousel/:id', true, updateCarouselSlide],
  ['DELETE', '/api/admin/carousel/:id', true, deleteCarouselSlide],
];

const matchRoute = (method, pathname) => {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  const pathSegments = cleanPath.split('/').filter(Boolean);

  for (const [routeMethod, pattern, isProtected, handler] of ROUTES) {
    if (routeMethod !== method) continue;
    const patternSegments = pattern.split('/').filter(Boolean);
    if (patternSegments.length !== pathSegments.length) continue;

    const params = {};
    let matched = true;

    for (let i = 0; i < patternSegments.length; i++) {
      const pat = patternSegments[i];
      const seg = pathSegments[i];
      if (pat.startsWith(':')) {
        params[pat.slice(1)] = decodeURIComponent(seg);
      } else if (pat !== seg) {
        matched = false;
        break;
      }
    }

    if (matched) {
      return { isProtected, handler, params };
    }
  }

  return null;
};

const buildCorsHeaders = (request) => {
  const origin = request.headers.get('Origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
};

const parseRequestPayload = async (request) => {
  const contentType = request.headers.get('content-type') || '';
  const body = {};
  let singleFile = null;
  const multipleFiles = [];

  if (contentType.includes('application/json')) {
    const parsed = await request.json().catch(() => ({}));
    return { body: parsed, file: null, files: [] };
  }

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    for (const [key, value] of formData.entries()) {
      if (value && typeof value === 'object' && typeof value.arrayBuffer === 'function') {
        const arrayBuf = await value.arrayBuffer();
        const fileObj = {
          fieldname: key,
          originalname: value.name || 'upload',
          mimetype: value.type || 'application/octet-stream',
          size: value.size || arrayBuf.byteLength,
          buffer: Buffer.from(arrayBuf),
        };
        if (!singleFile) singleFile = fileObj;
        multipleFiles.push(fileObj);
      } else {
        body[key] = value;
      }
    }
    return { body, file: singleFile, files: multipleFiles };
  }

  return { body, file: null, files: [] };
};

export async function onRequest(context) {
  const { request, env } = context;
  const corsHeaders = buildCorsHeaders(request);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Sync Cloudflare environment bindings into process.env for controllers
  if (env && typeof env === 'object') {
    for (const [key, value] of Object.entries(env)) {
      if (typeof value === 'string') {
        process.env[key] = value;
      }
    }
  }

  const url = new URL(request.url);
  const matched = matchRoute(request.method, url.pathname);

  if (!matched) {
    return new Response(JSON.stringify({ error: 'Endpoint não encontrado.' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { isProtected, handler, params } = matched;

  // Authenticate JWT if route is protected
  let user = null;
  if (isProtected) {
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return new Response(JSON.stringify({ message: 'Access denied. No token provided.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    try {
      user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return new Response(JSON.stringify({ message: 'Invalid or expired token.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // Parse query & body
  const query = Object.fromEntries(url.searchParams.entries());
  const { body, file, files } = await parseRequestPayload(request);

  const headersObj = {};
  for (const [k, v] of request.headers.entries()) {
    headersObj[k.toLowerCase()] = v;
  }

  // Build Express-compatible req & res
  const req = {
    method: request.method,
    url: url.pathname + url.search,
    originalUrl: url.pathname + url.search,
    path: url.pathname,
    headers: headersObj,
    query,
    params,
    body,
    file,
    files,
    user,
  };

  let statusCode = 200;
  let responseBody = null;
  let redirectUrl = null;
  const customHeaders = { ...corsHeaders };

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    setHeader(name, value) {
      customHeaders[name] = value;
      return this;
    },
    json(data) {
      customHeaders['Content-Type'] = 'application/json';
      responseBody = JSON.stringify(data);
      return this;
    },
    send(data) {
      if (typeof data === 'object' && data !== null && !Buffer.isBuffer(data)) {
        return this.json(data);
      }
      responseBody = data;
      return this;
    },
    redirect(targetUrl) {
      redirectUrl = targetUrl;
      return this;
    },
  };

  const requestPool = createRequestPool(process.env.DATABASE_URL);

  try {
    await dbContext.run(requestPool, async () => {
      await handler(req, res);
    });

    if (redirectUrl) {
      return Response.redirect(redirectUrl, 302);
    }

    return new Response(responseBody ?? JSON.stringify({ ok: true }), {
      status: statusCode,
      headers: customHeaders,
    });
  } catch (error) {
    console.error('[CF_API_ERROR]', {
      method: request.method,
      path: url.pathname,
      message: error.message,
    });
    return new Response(
      JSON.stringify({ error: 'Erro interno ao processar a solicitação.' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } finally {
    await requestPool.end().catch(() => {});
  }
}

