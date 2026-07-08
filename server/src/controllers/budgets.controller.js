import pool from '../db.js';
import { createCalendarEvent } from '../lib/googleCalendar.js';

const JSON_FIELDS = new Set(['package_data', 'extras_data', 'travel_data', 'discount_data', 'payment_data']);
const ALLOWED_BUDGET_FIELDS = [
  'source_type',
  'submission_id',
  'client_name',
  'client_phone',
  'client_email',
  'event_type',
  'event_date',
  'event_location',
  'selected_package_id',
  'selected_package_name',
  'package_price',
  'package_data',
  'extras_data',
  'travel_data',
  'discount_data',
  'payment_data',
  'subtotal',
  'total',
  'status',
  'pdf_document_id',
  'contract_document_id',
];
const errorResponse = () => ({
  error: 'Erro interno ao processar a solicitação.',
});

const normalizeBudgetPayload = (payload = {}) => {
  const normalized = {};

  for (const field of ALLOWED_BUDGET_FIELDS) {
    if (payload[field] === undefined) {
      continue;
    }

    if (JSON_FIELDS.has(field)) {
      normalized[field] = payload[field] ?? (field === 'extras_data' ? [] : {});
      continue;
    }

    normalized[field] = payload[field];
  }

  return normalized;
};

export const getAllBudgets = async (req, res) => {
  try {
    const { status, search, submissionId, sourceType } = req.query;
    let sql = `
      SELECT b.*, d.pdf_path, d.file_name, d.id as document_id
      FROM budgets b
      LEFT JOIN LATERAL (
        SELECT id, pdf_path, file_name
        FROM generated_documents
        WHERE budget_id = b.id AND document_type = 'budget'
        ORDER BY created_at DESC
        LIMIT 1
      ) d ON true
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status);
      sql += ` AND b.status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (b.client_name ILIKE $${params.length} OR CAST(b.budget_number AS TEXT) ILIKE $${params.length})`;
    }

    if (submissionId) {
      params.push(submissionId);
      sql += ` AND b.submission_id = $${params.length}`;
    }

    if (sourceType) {
      params.push(sourceType);
      sql += ` AND b.source_type = $${params.length}`;
    }

    sql += ' ORDER BY b.created_at DESC';

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('[Budgets] Error fetching budgets:', {
      message: error.message,
      code: error.code,
    });
    res.status(500).json(process.env.NODE_ENV === 'production'
      ? errorResponse()
      : { error: 'Failed to fetch budgets.' });
  }
};

export const getBudgetById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
        SELECT b.*,
          (SELECT json_agg(d.* ORDER BY d.created_at DESC) FROM generated_documents d WHERE d.budget_id = b.id) as documents
        FROM budgets b
        WHERE b.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Budget not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('[Budgets] Error fetching budget:', {
      message: error.message,
      code: error.code,
      budgetId: id,
    });
    res.status(500).json(process.env.NODE_ENV === 'production'
      ? errorResponse()
      : { error: 'Failed to fetch budget.' });
  }
};

export const createBudget = async (req, res) => {
  const budgetData = normalizeBudgetPayload(req.body);

  if (!budgetData.client_name || !budgetData.selected_package_id) {
    return res.status(400).json({
      error: 'client_name and selected_package_id are required.',
    });
  }

  try {
    console.log('[Budgets] Creating budget', {
      submissionId: budgetData.submission_id || null,
      selectedPackageId: budgetData.selected_package_id,
      sourceType: budgetData.source_type || 'manual',
    });

    const result = await pool.query(
      `INSERT INTO budgets
      (source_type, submission_id, client_name, client_phone, client_email,
       event_type, event_date, event_location, selected_package_id, selected_package_name,
       package_price, package_data, extras_data, travel_data, discount_data, payment_data,
       subtotal, total, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *`,
      [
        budgetData.source_type || 'manual',
        budgetData.submission_id || null,
        budgetData.client_name,
        budgetData.client_phone || null,
        budgetData.client_email || null,
        budgetData.event_type || null,
        budgetData.event_date || null,
        budgetData.event_location || null,
        budgetData.selected_package_id,
        budgetData.selected_package_name || null,
        budgetData.package_price || 0,
        JSON.stringify(budgetData.package_data || {}),
        JSON.stringify(budgetData.extras_data || []),
        JSON.stringify(budgetData.travel_data || {}),
        JSON.stringify(budgetData.discount_data || {}),
        JSON.stringify(budgetData.payment_data || {}),
        budgetData.subtotal || 0,
        budgetData.total || 0,
        budgetData.status || 'draft',
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('[Budgets] Error creating budget:', {
      message: error.message,
      code: error.code,
      selectedPackageId: budgetData.selected_package_id,
    });
    res.status(500).json(process.env.NODE_ENV === 'production'
      ? errorResponse()
      : { error: 'Failed to save budget.' });
  }
};

export const updateBudget = async (req, res) => {
  const { id } = req.params;
  const fields = normalizeBudgetPayload(req.body);

  if (Object.keys(fields).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update.' });
  }

  try {
    const entries = Object.entries(fields);
    const setClause = entries
      .map(([key], index) => `${key} = $${index + 2}`)
      .join(', ');
    const processedValues = entries.map(([key, value]) => (
      JSON_FIELDS.has(key) ? JSON.stringify(value) : value
    ));

    const result = await pool.query(
      `UPDATE budgets SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id, ...processedValues]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Budget not found.' });
    }

    const updatedBudget = result.rows[0];

    // Sincroniza com Google Calendar se aprovado
    if (fields.status === 'approved') {
      createCalendarEvent(updatedBudget).catch(err => {
        console.error('[Budgets] Falha ao enviar para o Google Calendar:', err);
      });
    }

    res.json(updatedBudget);
  } catch (error) {
    console.error('[Budgets] Error updating budget:', {
      message: error.message,
      code: error.code,
      budgetId: id,
    });
    res.status(500).json(process.env.NODE_ENV === 'production'
      ? errorResponse()
      : { error: 'Failed to update budget.' });
  }
};

export const getBudgetsStats = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status != 'cancelled') as active
      FROM budgets
    `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('[Budgets] Error fetching budget stats:', {
      message: error.message,
      code: error.code,
    });
    res.status(500).json(process.env.NODE_ENV === 'production'
      ? errorResponse()
      : { error: 'Failed to fetch budget stats.' });
  }
};
