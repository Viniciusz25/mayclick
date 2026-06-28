import path from 'path';
import pool from '../db.js';
import { supabase } from '../lib/supabase.js';

const isValidUUID = (id) => Boolean(
  id && id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
);

const isPdfByMagicBytes = (buffer) => {
  if (!buffer || buffer.length < 4) return false;
  return buffer.toString('utf8', 0, 4) === '%PDF';
};

const sanitizeDocumentType = (documentType = 'document') => (
  String(documentType)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 40) || 'document'
);

const buildSafeDownloadName = ({ documentType, id, createdAt }) => {
  const type = sanitizeDocumentType(documentType);
  const shortId = String(id || 'document').replace(/[^a-zA-Z0-9-]/g, '').slice(0, 12);
  const timestamp = createdAt ? new Date(createdAt).getTime() : Date.now();
  return `${type}_${shortId}_${timestamp}.pdf`;
};

const sanitizeDisplayFileName = (fileName = '') => {
  const cleaned = String(fileName || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\\/:"*?<>|]+/g, '_')
    .replace(/[^a-zA-Z0-9_.-]+/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 120);

  if (!cleaned) return '';
  return cleaned.toLowerCase().endsWith('.pdf') ? cleaned : `${cleaned}.pdf`;
};

export const saveDocument = async (req, res) => {
  let client;
  try {
    const { submissionId, budgetId, documentType, fileName } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    if (!documentType) {
      return res.status(400).json({ error: 'documentType is required.' });
    }

    if (!isPdfByMagicBytes(file.buffer)) {
      return res.status(400).json({ error: 'Arquivo PDF inválido.' });
    }

    console.log('[DocumentSave] Saving document', {
      documentType,
      submissionId: submissionId || null,
      budgetId: budgetId || null,
    });

    const targetSubmissionId = isValidUUID(submissionId) && submissionId !== budgetId ? submissionId : null;
    const targetBudgetId = isValidUUID(budgetId) ? budgetId : null;

    client = await pool.connect();
    await client.query('BEGIN');

    if (targetBudgetId) {
      const budgetResult = await client.query('SELECT id FROM budgets WHERE id = $1', [targetBudgetId]);
      if (budgetResult.rows.length === 0) {
        await client.query('ROLLBACK');
        client.release();
        return res.status(404).json({ error: 'Budget not found.' });
      }
    }

    if (targetSubmissionId) {
      const submissionResult = await client.query('SELECT id FROM form_submissions WHERE id = $1', [targetSubmissionId]);
      if (submissionResult.rows.length === 0) {
        await client.query('ROLLBACK');
        client.release();
        return res.status(404).json({ error: 'Submission not found.' });
      }
    }

    // Upload to Supabase Storage
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const supabaseFileName = `document-${uniqueSuffix}.pdf`;

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('documents')
      .upload(supabaseFileName, file.buffer, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    // Insert to DB
    const result = await client.query(
      `
        INSERT INTO generated_documents (submission_id, budget_id, document_type, pdf_path, file_name)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
      [targetSubmissionId, targetBudgetId, documentType, supabaseFileName, supabaseFileName]
    );

    const savedDocument = result.rows[0];
    const safeFileName = sanitizeDisplayFileName(fileName) || buildSafeDownloadName({
      documentType: savedDocument.document_type,
      id: savedDocument.id,
      createdAt: savedDocument.created_at,
    });

    const updated = await client.query(
      'UPDATE generated_documents SET file_name = $1 WHERE id = $2 RETURNING *',
      [safeFileName, savedDocument.id]
    );

    if (targetBudgetId) {
      await client.query('UPDATE budgets SET contract_document_id = $1 WHERE id = $2', [savedDocument.id, targetBudgetId]);
    }

    await client.query('COMMIT');
    client.release();

    res.json(updated.rows[0]);
  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK');
        client.release();
      } catch (rollbackError) {
        console.error('Error during rollback:', rollbackError);
      }
    }
    console.error('[DocumentSave] Failed to save document:', error);
    res.status(500).json({ error: 'Failed to save document to database.' });
  }
};

export const listDocuments = async (req, res) => {
  try {
    const { submissionId, budgetId, documentType } = req.query;
    let sql = 'SELECT * FROM generated_documents WHERE 1=1';
    const values = [];

    if (submissionId) {
      values.push(submissionId);
      sql += ` AND submission_id = $${values.length}`;
    }
    if (budgetId) {
      values.push(budgetId);
      sql += ` AND budget_id = $${values.length}`;
    }
    if (documentType) {
      values.push(documentType);
      sql += ` AND document_type = $${values.length}`;
    }

    sql += ' ORDER BY created_at DESC';
    const result = await pool.query(sql, values);
    res.json(result.rows);
  } catch (error) {
    console.error('[Documents] Error listing documents:', error);
    res.status(500).json({ error: 'Failed to list documents.' });
  }
};

export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM generated_documents WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    const document = result.rows[0];

    // Get signed URL for 1 hour to allow safe download
    const { data, error } = await supabase
      .storage
      .from('documents')
      .createSignedUrl(document.pdf_path, 3600);

    if (error || !data) {
      console.error('[Documents] Supabase sign url error:', error);
      return res.status(404).json({ error: 'File not found on storage.' });
    }

    // Redirect the user to the signed URL so the browser downloads it
    res.redirect(data.signedUrl);

  } catch (error) {
    console.error('[Documents] Error downloading document:', error);
    res.status(500).json({ error: 'Erro interno ao processar a solicitação.' });
  }
};
