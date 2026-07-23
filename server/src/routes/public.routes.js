import express from 'express';
import { createSubmission } from '../controllers/submissions.controller.js';
import { getPublicPackages } from '../controllers/packages.controller.js';
import { getPublicExtras } from '../controllers/extras.controller.js';
import { getPublicHomeData } from '../controllers/homepage.controller.js';
import { getPublicCarouselSlides } from '../controllers/carousel.controller.js';
import pool from '../db.js';

const router = express.Router();

router.post('/submissions', createSubmission);
router.get('/packages', getPublicPackages);
router.get('/extras', getPublicExtras);
router.get('/home-data', getPublicHomeData);
router.get('/carousel', getPublicCarouselSlides);

// Public portfolio — all active categories
router.get('/portfolio', async (req, res) => {
  try {
    const cats = await pool.query(
      'SELECT * FROM portfolio_categories WHERE active = TRUE AND (is_hidden_from_portfolio = FALSE OR is_hidden_from_portfolio IS NULL) ORDER BY sort_order ASC, created_at DESC'
    );
    // Attach photo count to each category
    const catIds = cats.rows.map(c => c.id);
    let photoCounts = {};
    if (catIds.length > 0) {
      const counts = await pool.query(
        `SELECT category_id, COUNT(*) as count FROM portfolio_photos
         WHERE active = TRUE AND category_id = ANY($1) GROUP BY category_id`,
        [catIds]
      );
      counts.rows.forEach(r => { photoCounts[r.category_id] = parseInt(r.count); });
    }
    const result = cats.rows.map(c => ({ ...c, photo_count: photoCounts[c.id] || 0 }));
    res.json(result);
  } catch (err) {
    console.error('[PUBLIC /portfolio]', err.message);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Public portfolio — single category with its photos by slug
router.get('/portfolio/:slug', async (req, res) => {
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

    // Also fetch all categories for the nav
    const allCats = await pool.query(
      'SELECT id, slug, title FROM portfolio_categories WHERE active = TRUE AND is_hidden_from_portfolio = FALSE ORDER BY sort_order ASC'
    );

    res.json({ category, photos: photosResult.rows, albums: albumsResult.rows, allCategories: allCats.rows });
  } catch (err) {
    console.error('[PUBLIC /portfolio/:slug]', err.message);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Public portfolio — single album
router.get('/portfolio/:catSlug/:albumSlug', async (req, res) => {
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

    res.json({ album, category, photos: photosResult.rows, allCategories: allCats.rows });
  } catch (err) {
    console.error('[PUBLIC /portfolio/:catSlug/:albumSlug]', err.message);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

export default router;
