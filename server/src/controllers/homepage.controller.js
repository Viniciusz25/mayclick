import pool from '../db.js';

const sanitizeError = (error) => ({
  message: error.message,
  code: error.code,
});

// TESTIMONIALS
export const getTestimonials = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM testimonials ORDER BY sort_order ASC, created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching testimonials:', sanitizeError(error));
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const createTestimonial = async (req, res) => {
  const { client_name, client_photo_url, content, stars, active, sort_order } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO testimonials (client_name, client_photo_url, content, stars, active, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [client_name, client_photo_url, content, stars ?? 5, active ?? true, sort_order ?? 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating testimonial:', sanitizeError(error));
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const updateTestimonial = async (req, res) => {
  const { id } = req.params;
  const { client_name, client_photo_url, content, stars, active, sort_order } = req.body;
  try {
    const result = await pool.query(
      `UPDATE testimonials SET client_name = $1, client_photo_url = $2, content = $3, 
       stars = $4, active = $5, sort_order = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [client_name, client_photo_url, content, stars, active, sort_order, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Testimonial not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating testimonial:', sanitizeError(error));
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const deleteTestimonial = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM testimonials WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Testimonial not found.' });
    res.json({ message: 'Testimonial deleted successfully.' });
  } catch (error) {
    console.error('Error deleting testimonial:', sanitizeError(error));
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// HOME HIGHLIGHTS
export const getHomeHighlights = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM home_highlights ORDER BY sort_order ASC, created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching highlights:', sanitizeError(error));
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const createHomeHighlight = async (req, res) => {
  const { eyebrow, title, description, button_text, button_link, image_url, active, sort_order } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO home_highlights (eyebrow, title, description, button_text, button_link, image_url, active, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [eyebrow, title, description, button_text, button_link, image_url, active ?? true, sort_order ?? 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating highlight:', sanitizeError(error));
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const updateHomeHighlight = async (req, res) => {
  const { id } = req.params;
  const { eyebrow, title, description, button_text, button_link, image_url, active, sort_order } = req.body;
  try {
    const result = await pool.query(
      `UPDATE home_highlights SET eyebrow = $1, title = $2, description = $3, 
       button_text = $4, button_link = $5, image_url = $6, active = $7, sort_order = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 RETURNING *`,
      [eyebrow, title, description, button_text, button_link, image_url, active, sort_order, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Highlight not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating highlight:', sanitizeError(error));
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const deleteHomeHighlight = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM home_highlights WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Highlight not found.' });
    res.json({ message: 'Highlight deleted successfully.' });
  } catch (error) {
    console.error('Error deleting highlight:', sanitizeError(error));
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// PORTFOLIO CATEGORIES
export const getPortfolioCategories = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM portfolio_categories ORDER BY sort_order ASC, created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', sanitizeError(error));
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const createPortfolioCategory = async (req, res) => {
  const { slug, title, description, cover_image_url, active, sort_order, is_hidden_from_portfolio } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO portfolio_categories (slug, title, description, cover_image_url, active, sort_order, is_hidden_from_portfolio)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [slug, title, description, cover_image_url, active ?? true, sort_order ?? 0, is_hidden_from_portfolio ?? false]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating category:', sanitizeError(error));
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const updatePortfolioCategory = async (req, res) => {
  const { id } = req.params;
  const { slug, title, description, cover_image_url, active, sort_order, is_hidden_from_portfolio } = req.body;
  try {
    const result = await pool.query(
      `UPDATE portfolio_categories SET slug = $1, title = $2, description = $3, 
       cover_image_url = $4, active = $5, sort_order = $6, is_hidden_from_portfolio = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [slug, title, description, cover_image_url, active, sort_order, is_hidden_from_portfolio ?? false, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Category not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating category:', sanitizeError(error));
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const deletePortfolioCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE portfolio_photos SET category_id = NULL WHERE category_id = $1', [id]);
    const result = await pool.query('DELETE FROM portfolio_categories WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Category not found.' });
    res.json({ message: 'Category deleted successfully.' });
  } catch (error) {
    console.error('Error deleting category:', sanitizeError(error));
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Bulk reorder categories
export const reorderCategories = async (req, res) => {
  // Expects body: [{ id: uuid, sort_order: number }, ...]
  const items = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'items array is required.' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const { id, sort_order } of items) {
      await client.query(
        'UPDATE portfolio_categories SET sort_order = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [sort_order, id]
      );
    }
    await client.query('COMMIT');
    res.json({ message: 'Order updated successfully.', count: items.length });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error reordering categories:', sanitizeError(error));
    res.status(500).json({ message: 'Internal server error.' });
  } finally {
    client.release();
  }
};

// Bulk reorder photos
export const reorderPortfolioPhotos = async (req, res) => {
  const items = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'items array is required.' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const { id, sort_order } of items) {
      await client.query(
        'UPDATE portfolio_photos SET sort_order = $1 WHERE id = $2',
        [sort_order, id]
      );
    }
    await client.query('COMMIT');
    res.json({ message: 'Order updated successfully.', count: items.length });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error reordering photos:', sanitizeError(error));
    res.status(500).json({ message: 'Internal server error.' });
  } finally {
    client.release();
  }
};

// PORTFOLIO ALBUMS
export const getPortfolioAlbums = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM portfolio_albums ORDER BY sort_order ASC, created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching albums:', sanitizeError(error));
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const createPortfolioAlbum = async (req, res) => {
  const { category_id, title, slug, cover_image_url, sort_order, active } = req.body;
  if (!category_id || !title || !slug) return res.status(400).json({ message: 'category_id, title and slug are required.' });
  try {
    const result = await pool.query(
      `INSERT INTO portfolio_albums (category_id, title, slug, cover_image_url, sort_order, active)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [category_id, title, slug, cover_image_url || null, sort_order || 0, active ?? true]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating album:', sanitizeError(error));
    if (error.code === '23505') return res.status(400).json({ message: 'Slug already in use.' });
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const updatePortfolioAlbum = async (req, res) => {
  const { id } = req.params;
  const { category_id, title, slug, cover_image_url, sort_order, active } = req.body;
  try {
    const result = await pool.query(
      `UPDATE portfolio_albums 
       SET category_id = $1, title = $2, slug = $3, cover_image_url = $4, sort_order = $5, active = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [category_id, title, slug, cover_image_url, sort_order, active, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Album not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating album:', sanitizeError(error));
    if (error.code === '23505') return res.status(400).json({ message: 'Slug already in use.' });
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const deletePortfolioAlbum = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM portfolio_albums WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Album not found.' });
    res.json({ message: 'Album deleted successfully.' });
  } catch (error) {
    console.error('Error deleting album:', sanitizeError(error));
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const reorderPortfolioAlbums = async (req, res) => {
  const items = req.body;
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'items array is required.' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const { id, sort_order } of items) {
      await client.query(
        'UPDATE portfolio_albums SET sort_order = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [sort_order, id]
      );
    }
    await client.query('COMMIT');
    res.json({ message: 'Order updated successfully.', count: items.length });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error reordering albums:', sanitizeError(error));
    res.status(500).json({ message: 'Internal server error.' });
  } finally {
    client.release();
  }
};

// PORTFOLIO PHOTOS
export const getPortfolioPhotos = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM portfolio_photos ORDER BY sort_order ASC, created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching photos:', sanitizeError(error));
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const createPortfolioPhoto = async (req, res) => {
  const { category_id, album_id, image_url, is_cover, is_featured_home, active, sort_order, title, description } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO portfolio_photos (category_id, album_id, image_url, is_cover, is_featured_home, active, sort_order, title, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [category_id || null, album_id || null, image_url, is_cover ?? false, is_featured_home ?? false, active ?? true, sort_order ?? 0, title || null, description || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating photo:', sanitizeError(error));
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const updatePortfolioPhoto = async (req, res) => {
  const { id } = req.params;
  const { category_id, album_id, image_url, is_cover, is_featured_home, active, sort_order, title, description } = req.body;
  try {
    const result = await pool.query(
      `UPDATE portfolio_photos 
       SET category_id = $1, album_id = $2, image_url = $3, is_cover = $4, is_featured_home = $5, active = $6, sort_order = $7, title = $8, description = $9
       WHERE id = $10 RETURNING *`,
      [category_id || null, album_id || null, image_url, is_cover, is_featured_home, active, sort_order, title || null, description || null, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Photo not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating photo:', sanitizeError(error));
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const deletePortfolioPhoto = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM portfolio_photos WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Photo not found.' });
    res.json({ message: 'Photo deleted successfully.' });
  } catch (error) {
    console.error('Error deleting photo:', sanitizeError(error));
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// PUBLIC COMBINED DATA
export const getPublicHomeData = async (req, res) => {
  try {
    const settingsRes = await pool.query('SELECT * FROM business_settings LIMIT 1');
    const settings = settingsRes.rows[0] || {};

    const testimonialsRes = await pool.query('SELECT * FROM testimonials WHERE active = TRUE ORDER BY sort_order ASC, created_at DESC');
    const categoriesRes = await pool.query('SELECT * FROM portfolio_categories WHERE active = TRUE AND (is_hidden_from_portfolio = FALSE OR is_hidden_from_portfolio IS NULL) ORDER BY sort_order ASC, created_at DESC');
    const featuredPhotosRes = await pool.query('SELECT * FROM portfolio_photos WHERE active = TRUE AND is_featured_home = TRUE ORDER BY sort_order ASC, created_at DESC');
    const highlightsRes = await pool.query('SELECT * FROM home_highlights WHERE active = TRUE ORDER BY sort_order ASC, created_at DESC');

    // Fetch hero carousel photos from selected category
    let heroCarouselPhotos = [];
    const heroSlug = settings.hero_carousel_category_slug;
    if (heroSlug) {
      const catRes = await pool.query(
        'SELECT id FROM portfolio_categories WHERE slug = $1 AND active = TRUE LIMIT 1',
        [heroSlug]
      );
      if (catRes.rowCount > 0) {
        const catId = catRes.rows[0].id;
        const photosRes = await pool.query(
          `SELECT image_url FROM portfolio_photos
           WHERE category_id = $1 AND active = TRUE
           ORDER BY sort_order ASC, created_at DESC
           LIMIT 20`,
          [catId]
        );
        heroCarouselPhotos = photosRes.rows.map(r => r.image_url);
      }
    }

    res.json({
      settings,
      testimonials: testimonialsRes.rows,
      categories: categoriesRes.rows,
      featuredPhotos: featuredPhotosRes.rows,
      heroCarouselPhotos,
      highlights: highlightsRes.rows,
    });
  } catch (error) {
    console.error('Error fetching home data:', sanitizeError(error));
    res.status(500).json({ message: 'Internal server error.' });
  }
};
