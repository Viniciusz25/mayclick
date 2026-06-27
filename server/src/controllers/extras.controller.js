import pool from '../db.js';

const sanitizeError = (error) => ({
  message: error.message,
  code: error.code,
});

const normalizeExtraPayload = (payload = {}) => {
  const price = Number(payload.price ?? 0);
  const sortOrder = Number.parseInt(payload.sort_order ?? payload.sortOrder ?? 0, 10);

  return {
    name: String(payload.name || '').trim(),
    description: payload.description == null ? '' : String(payload.description),
    price: Number.isFinite(price) ? price : 0,
    active: payload.active === undefined ? true : Boolean(payload.active),
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
  };
};

const validateExtra = (extra) => {
  const errors = [];

  if (!extra.name) errors.push('name is required.');
  if (extra.name.length > 160) errors.push('name is too long.');
  if (extra.price < 0) errors.push('price must be zero or greater.');

  return errors;
};

const ensureExtraArchiveColumns = async () => {
  await pool.query(`
    ALTER TABLE extras
      ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

    ALTER TABLE extras
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

    UPDATE extras
    SET archived = FALSE
    WHERE archived IS NULL;

    ALTER TABLE extras
      ALTER COLUMN archived SET DEFAULT FALSE;
  `);
};

// ADMIN: Get all extras
export const getAllExtras = async (req, res) => {
  try {
    await ensureExtraArchiveColumns();
    const includeDeleted = req.query.includeDeleted === 'true';
    const result = await pool.query(`
      SELECT *
      FROM extras
      ${includeDeleted ? '' : 'WHERE deleted_at IS NULL AND archived = false'}
      ORDER BY sort_order ASC, name ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching extras:', sanitizeError(error));
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// PUBLIC: Get active extras only
export const getPublicExtras = async (req, res) => {
  try {
    await ensureExtraArchiveColumns();
    const result = await pool.query(
      `SELECT id, name, description, price
       FROM extras
       WHERE active = true
         AND deleted_at IS NULL
         AND archived = false
       ORDER BY sort_order ASC, name ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching public extras:', sanitizeError(error));
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// ADMIN: Create extra
export const createExtra = async (req, res) => {
  const extra = normalizeExtraPayload(req.body);
  const errors = validateExtra(extra);

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(' ') });
  }

  try {
    const result = await pool.query(
      'INSERT INTO extras (name, description, price, sort_order, active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [extra.name, extra.description, extra.price, extra.sort_order, extra.active]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating extra:', sanitizeError(error));
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// ADMIN: Update extra
export const updateExtra = async (req, res) => {
  const { id } = req.params;
  const extra = normalizeExtraPayload(req.body);
  const errors = validateExtra(extra);

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(' ') });
  }

  try {
    await ensureExtraArchiveColumns();
    const result = await pool.query(
      `UPDATE extras
       SET name = $1,
           description = $2,
           price = $3,
           sort_order = $4,
           active = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
         AND deleted_at IS NULL
         AND archived = false
       RETURNING *`,
      [extra.name, extra.description, extra.price, extra.sort_order, extra.active, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Extra not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating extra:', sanitizeError(error));
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// ADMIN: Delete extra (Soft delete/Deactivate)
export const deleteExtra = async (req, res) => {
  const { id } = req.params;
  try {
    await ensureExtraArchiveColumns();
    const result = await pool.query(
      `UPDATE extras
       SET active = false,
           archived = true,
           deleted_at = COALESCE(deleted_at, CURRENT_TIMESTAMP),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Extra not found.' });
    res.json({
      ...result.rows[0],
      deleted: true,
      archived: true,
      message: 'Extra excluído da interface com sucesso.',
    });
  } catch (error) {
    console.error('Error deleting extra:', sanitizeError(error));
    res.status(500).json({ message: 'Internal server error.' });
  }
};
