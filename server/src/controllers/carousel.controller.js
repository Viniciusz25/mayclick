import pool from '../db.js';

const sanitizeError = (error) => ({
  message: error.message,
  code: error.code,
});

// GET all slides (admin)
export const getCarouselSlides = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM carousel_slides ORDER BY sort_order ASC, created_at ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching carousel slides:', sanitizeError(error));
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// GET active slides (public)
export const getPublicCarouselSlides = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM carousel_slides WHERE active = TRUE ORDER BY sort_order ASC, created_at ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching public carousel slides:', sanitizeError(error));
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// POST create slide
export const createCarouselSlide = async (req, res) => {
  const { image_url, title, subtitle, link_url, link_label, active, sort_order } = req.body;
  if (!image_url) {
    return res.status(400).json({ message: 'image_url is required.' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO carousel_slides (image_url, title, subtitle, link_url, link_label, active, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [image_url, title || null, subtitle || null, link_url || null, link_label || 'Ver Mais', active ?? true, sort_order ?? 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating carousel slide:', sanitizeError(error));
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// PUT update slide
export const updateCarouselSlide = async (req, res) => {
  const { id } = req.params;
  const { image_url, title, subtitle, link_url, link_label, active, sort_order } = req.body;
  try {
    const result = await pool.query(
      `UPDATE carousel_slides
       SET image_url = $1, title = $2, subtitle = $3, link_url = $4, link_label = $5,
           active = $6, sort_order = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [image_url, title || null, subtitle || null, link_url || null, link_label || 'Ver Mais', active, sort_order, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Slide not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating carousel slide:', sanitizeError(error));
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// DELETE slide
export const deleteCarouselSlide = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM carousel_slides WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Slide not found.' });
    res.json({ message: 'Slide deleted successfully.' });
  } catch (error) {
    console.error('Error deleting carousel slide:', sanitizeError(error));
    res.status(500).json({ message: 'Internal server error.' });
  }
};
