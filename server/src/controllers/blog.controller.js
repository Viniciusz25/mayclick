import pool from '../db.js';

export const getBlogPosts = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM blog_posts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching blog posts:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBlogPost = async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query('SELECT * FROM blog_posts WHERE slug = $1', [slug]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching blog post:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const incrementViews = async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      'UPDATE blog_posts SET views = views + 1 WHERE slug = $1 RETURNING views',
      [slug]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({ views: result.rows[0].views });
  } catch (err) {
    console.error('Error incrementing views:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const likePost = async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      'UPDATE blog_posts SET likes = likes + 1 WHERE slug = $1 RETURNING likes',
      [slug]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({ likes: result.rows[0].likes });
  } catch (err) {
    console.error('Error liking post:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createBlogPost = async (req, res) => {
  try {
    const { title, slug, cover_image_url, category, excerpt, content } = req.body;
    const result = await pool.query(
      'INSERT INTO blog_posts (title, slug, cover_image_url, category, excerpt, content) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, slug, cover_image_url, category, excerpt, content]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateBlogPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, cover_image_url, category, excerpt, content } = req.body;
    const result = await pool.query(
      'UPDATE blog_posts SET title = $1, slug = $2, cover_image_url = $3, category = $4, excerpt = $5, content = $6 WHERE id = $7 RETURNING *',
      [title, slug, cover_image_url, category, excerpt, content, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating post:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteBlogPost = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM blog_posts WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
