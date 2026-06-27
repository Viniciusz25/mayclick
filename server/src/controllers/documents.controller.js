import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pool from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storagePath = path.resolve(
  process.env.STORAGE_DIR || path.resolve(__dirname, '../../storage/documents')
);
const resolvedStoragePath = path.resolve(storagePath);

if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath, { recursive: true });
}

const isValidUUID = (id) => Boolean(
  id && id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
);

const isPdfByMagicBytes = (filePath) => {
  const fileDescriptor = fs.openSync(filePath, 'r');
  try {
    const buffer = Buffer.alloc(4);
    fs.readSync(fileDescriptor, buffer, 0, 4, 0);
    return buffer.toString('utf8') === '%PDF';
  } finally {
    fs.closeSync(fileDescriptor);
  }
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

const removeUploadedFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
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
      removeUploadedFile(file.path);
      return res.status(400).json({ error: 'documentType is required.' });
    }

    if (!isPdfByMagicBytes(file.path)) {
      removeUploadedFile(file.path);
      return res.status(400).json({ error: 'Arquivo PDF inválido.' });
    }

    console.log('[DocumentSave] Saving document', {
      documentType,
      submissionId: submissionId || null,
      budgetId: budgetId || null,
    });

    const targetSubmissionId = isValidUUID(submissionId) && submissionId !== budgetId ? submissionId : null;
    const targetBudgetId = isValidUUID(budgetId) ? budgetId : null;

    if (submissionId && !targetSubmissionId) {
      console.warn('[DocumentSave] Invalid or ignored submissionId received');
    }
    if (budgetId && !targetBudgetId) {
      console.warn('[DocumentSave] Invalid budgetId received');
    }

    client = await pool.connect();
    await client.query('BEGIN');

    if (targetBudgetId) {
      const budgetResult = await client.query('SELECT id FROM budgets WHERE id = $1', [targetBudgetId]);
      if (budgetResult.rows.length === 0) {
        await client.query('ROLLBACK');
        client.release();
        client = null;
        removeUploadedFile(file.path);
        return res.status(404).json({ error: 'Budget not found.' });
      }
    }

    if (targetSubmissionId) {
      const submissionResult = await client.query('SELECT id FROM form_submissions WHERE id = $1', [targetSubmissionId]);
      if (submissionResult.rows.length === 0) {
        await client.query('ROLLBACK');
        client.release();
        client = null;
        removeUploadedFile(file.path);
        return res.status(404).json({ error: 'Submission not found.' });
      }
    }

    const result = await client.query(
      `
        INSERT INTO generated_documents (submission_id, budget_id, document_type, pdf_path, file_name)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
      [targetSubmissionId, targetBudgetId, documentType, file.filename, file.filename]
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
      await client.query(
        'UPDATE budgets SET pdf_document_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [savedDocument.id, targetBudgetId]
      );
    }

    await client.query('COMMIT');
    client.release();
    client = null;

    console.log('[DocumentSave] Success', {
      documentId: savedDocument.id,
      documentType: savedDocument.document_type,
    });
    res.status(201).json(updated.rows[0]);
  } catch (error) {
    console.error('[DocumentSave] Error:', {
      message: error.message,
      code: error.code,
    });
    if (client) {
      await client.query('ROLLBACK').catch(() => {});
    }
    if (req.file?.path) {
      removeUploadedFile(req.file.path);
    }
    if (client) {
      client.release();
      client = null;
    }
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(500).json({
      error: isProduction ? 'Erro interno ao processar a solicitação.' : 'Failed to save document to database.',
    });
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
    console.error('[Documents] Error listing documents:', {
      message: error.message,
      code: error.code,
    });
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
    const filePath = path.resolve(resolvedStoragePath, document.pdf_path);

    if (!filePath.startsWith(`${resolvedStoragePath}${path.sep}`)) {
      return res.status(403).json({ error: 'Invalid document path.' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${document.file_name || 'document.pdf'}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error('[Documents] Error downloading document:', {
      message: error.message,
      code: error.code,
      documentId: req.params.id,
    });
    res.status(500).json({ error: 'Erro interno ao processar a solicitação.' });
  }
};
