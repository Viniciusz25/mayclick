import pool from '../db.js';

const sanitizeSubmissionLog = ({
  eventData,
  selectedPackageId,
  selectedPackageName,
}) => ({
  eventDate: eventData?.date || null,
  selectedPackageId,
  selectedPackageName: selectedPackageName || null,
});

const errorResponse = () => ({
  error: 'Erro interno ao processar a solicitação.',
});

let submissionArchiveColumnsReady = false;
let submissionPersistenceColumnsReady = false;

const ensureSubmissionPersistenceColumns = async () => {
  if (submissionPersistenceColumnsReady) return;

  await pool.query(`
    ALTER TABLE form_submissions
      ADD COLUMN IF NOT EXISTS extras_data JSONB DEFAULT '[]'::jsonb;

    ALTER TABLE form_submissions
      ADD COLUMN IF NOT EXISTS payment_data JSONB DEFAULT '{}'::jsonb;

    ALTER TABLE form_submissions
      ALTER COLUMN extras_data SET DEFAULT '[]'::jsonb;

    ALTER TABLE form_submissions
      ALTER COLUMN payment_data SET DEFAULT '{}'::jsonb;

    UPDATE form_submissions
    SET extras_data = '[]'::jsonb
    WHERE extras_data IS NULL
      OR jsonb_typeof(extras_data) <> 'array';

    UPDATE form_submissions
    SET payment_data = '{}'::jsonb
    WHERE payment_data IS NULL
      OR jsonb_typeof(payment_data) <> 'object';
  `);

  submissionPersistenceColumnsReady = true;
};

const ensureSubmissionArchiveColumns = async () => {
  if (submissionArchiveColumnsReady) return;

  await pool.query(`
    ALTER TABLE form_submissions
      ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

    ALTER TABLE form_submissions
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

    UPDATE form_submissions
    SET archived = FALSE
    WHERE archived IS NULL;

    ALTER TABLE form_submissions
      ALTER COLUMN archived SET DEFAULT FALSE;

    ALTER TABLE form_submissions
      ALTER COLUMN archived SET NOT NULL;
  `);

  submissionArchiveColumnsReady = true;
};

const hasFormSubmissionUpdatedAt = async () => {
  const result = await pool.query(
    `
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'form_submissions'
        AND column_name = 'updated_at'
      LIMIT 1
    `
  );

  return result.rows.length > 0;
};

const safeText = (value) => {
  const text = value == null ? '' : String(value).trim();
  return text && !['undefined', 'null'].includes(text.toLowerCase()) ? text : '';
};

const parseJsonInput = (value) => {
  if (value == null || value === '') return undefined;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    try {
      return JSON.parse(trimmed);
    } catch {
      return undefined;
    }
  }

  return value;
};

const isPlainObject = (value) => (
  value !== null
  && typeof value === 'object'
  && !Array.isArray(value)
);

const safeJsonObject = (value, fallback = {}) => {
  const parsed = parseJsonInput(value);
  return isPlainObject(parsed) ? parsed : fallback;
};

const safeJsonArray = (value, fallback = []) => {
  const parsed = parseJsonInput(value);
  return Array.isArray(parsed) ? parsed : fallback;
};

const compactWitness = (value) => {
  const source = safeJsonObject(value);
  const witness = {
    name: safeText(source.name),
    cpf: safeText(source.cpf),
  };

  return witness.name || witness.cpf ? witness : null;
};

const normalizeWitnessData = (witnessData = {}) => {
  const source = safeJsonObject(witnessData);
  const providedWitnesses = safeJsonArray(source.witnesses);
  const fallbackFirst = {
    name: source.name || source.witness1?.name || source.first?.name,
    cpf: source.cpf || source.witness1?.cpf || source.first?.cpf,
  };
  const witnessCandidates = [
    providedWitnesses[0] || fallbackFirst,
    providedWitnesses[1] || source.witness2 || source.second,
  ];
  const witnesses = witnessCandidates
    .map(compactWitness)
    .filter(Boolean);
  const primaryWitness = witnesses[0] || compactWitness(fallbackFirst) || { name: '', cpf: '' };

  return {
    ...source,
    name: primaryWitness.name,
    cpf: primaryWitness.cpf,
    witnesses,
    ...(witnesses[0] ? { witness1: witnesses[0] } : {}),
    ...(witnesses[1] ? { witness2: witnesses[1] } : {}),
  };
};

const normalizeExtrasData = (extrasData = []) => {
  const source = safeJsonArray(extrasData);

  return source
    .map((extra) => {
      const price = Number(extra?.price ?? 0);
      const quantity = Number(extra?.quantity ?? 1);
      const safePrice = Number.isFinite(price) ? price : 0;
      const safeQuantity = Number.isFinite(quantity) ? Math.max(0, quantity) : 1;

      return {
        id: safeText(extra?.id),
        name: safeText(extra?.name || extra?.label || extra?.title),
        description: safeText(extra?.description),
        price: safePrice,
        quantity: safeQuantity,
        total: Number.isFinite(Number(extra?.total))
          ? Number(extra.total)
          : safePrice * safeQuantity,
      };
    })
    .filter((extra) => extra.name && extra.quantity > 0);
};

const getMissingWitnessFields = (witnessData) => ([
  !witnessData.name ? 'nome da testemunha' : null,
  !witnessData.cpf ? 'CPF da testemunha' : null,
].filter(Boolean));

// PUBLIC: Create submission
export const createSubmission = async (req, res) => {
  const contractorData = safeJsonObject(req.body.contractor_data ?? req.body.contractor, {});
  const witnessData = normalizeWitnessData(req.body.witness_data ?? req.body.witness ?? {});
  const eventData = safeJsonObject(req.body.event_data ?? req.body.event, {});
  const selectedPackageId = req.body.selected_package_id || req.body.selectedPackageId;
  const selectedPackageName = req.body.selected_package_name || req.body.selectedPackageName || null;
  const payment = safeJsonObject(req.body.payment_data ?? req.body.payment, {});
  const extrasData = normalizeExtrasData(req.body.extras_data ?? req.body.extras ?? eventData.selectedExtras ?? []);
  const contractualConsent =
    req.body.contractual_consent ?? req.body.contractualConsent ?? false;
  const finalPaymentMethod =
    req.body.payment_method || req.body.paymentMethod || payment.method || 'A definir';
  const finalImportantNotes =
    req.body.important_notes || req.body.importantNotes || req.body.observations || '';

  if (!contractorData?.fullName) {
    return res.status(400).json({
      error: 'Missing required fields: contractor_data.fullName is required.',
    });
  }

  // Validação de testemunhas removida para simplificar formulário

  try {
    await ensureSubmissionPersistenceColumns();

    console.log('[Submissions] Creating submission', sanitizeSubmissionLog({
      eventData,
      selectedPackageId,
      selectedPackageName,
    }));

    const result = await pool.query(
      `INSERT INTO form_submissions
      (contractor_data, witness_data, event_data, selected_package_id, selected_package_name, payment_method, contractual_consent, important_notes, extras_data, payment_data)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, created_at`,
      [
        JSON.stringify(contractorData),
        JSON.stringify(witnessData),
        JSON.stringify({
          ...eventData,
          selectedExtras: extrasData,
        }),
        selectedPackageId,
        selectedPackageName,
        finalPaymentMethod,
        Boolean(contractualConsent),
        finalImportantNotes,
        JSON.stringify(extrasData),
        JSON.stringify(payment),
      ]
    );

    res.status(201).json({
      id: result.rows[0].id,
      submissionId: result.rows[0].id,
      created_at: result.rows[0].created_at,
      message: 'Submission received successfully.',
    });
  } catch (error) {
    console.error('[Submissions] Error creating submission', {
      message: error.message,
      code: error.code,
      submission: sanitizeSubmissionLog({
        eventData,
        selectedPackageId,
        selectedPackageName,
      }),
    });
    res.status(500).json(process.env.NODE_ENV === 'production'
      ? errorResponse()
      : { error: 'Failed to save submission.' });
  }
};

// ADMIN: Get all submissions
export const getAllSubmissions = async (req, res) => {
  try {
    await ensureSubmissionArchiveColumns();

    const result = await pool.query(`
      SELECT s.*, COALESCE(s.selected_package_name, p.name) as package_name
      FROM form_submissions s
      LEFT JOIN packages p ON s.selected_package_id = p.id::text
      WHERE s.archived = false
        AND s.deleted_at IS NULL
      ORDER BY s.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('[Submissions] Error fetching submissions:', {
      message: error.message,
      code: error.code,
    });
    res.status(500).json(process.env.NODE_ENV === 'production'
      ? errorResponse()
      : { error: 'Failed to fetch submissions.' });
  }
};

// ADMIN: Get submission by ID
export const getSubmissionById = async (req, res) => {
  const { id } = req.params;
  try {
    await ensureSubmissionArchiveColumns();

    const result = await pool.query(`
      SELECT s.*, COALESCE(s.selected_package_name, p.name) as package_name
      FROM form_submissions s
      LEFT JOIN packages p ON s.selected_package_id = p.id::text
      WHERE s.id = $1
        AND s.archived = false
        AND s.deleted_at IS NULL
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('[Submissions] Error fetching submission:', {
      message: error.message,
      code: error.code,
      submissionId: id,
    });
    res.status(500).json(process.env.NODE_ENV === 'production'
      ? errorResponse()
      : { error: 'Failed to fetch submission.' });
  }
};

// ADMIN: Archive submission by ID
export const deleteSubmission = async (req, res) => {
  const { id } = req.params;

  try {
    await ensureSubmissionArchiveColumns();

    const existing = await pool.query(
      'SELECT id FROM form_submissions WHERE id = $1 AND archived = false AND deleted_at IS NULL',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    const updateHasUpdatedAt = await hasFormSubmissionUpdatedAt();
    const result = await pool.query(
      `
        UPDATE form_submissions
        SET archived = true,
            deleted_at = COALESCE(deleted_at, CURRENT_TIMESTAMP)
            ${updateHasUpdatedAt ? ', updated_at = CURRENT_TIMESTAMP' : ''}
        WHERE id = $1
        RETURNING id, archived, deleted_at
      `,
      [id]
    );

    res.json({
      ...result.rows[0],
      deleted: true,
      message: 'Resposta arquivada com sucesso.',
    });
  } catch (error) {
    console.error('[Submissions] Error deleting submission:', {
      message: error.message,
      code: error.code,
      submissionId: id,
    });
    res.status(500).json(process.env.NODE_ENV === 'production'
      ? errorResponse()
      : { error: 'Failed to delete submission.' });
  }
};

// ADMIN: Update submission
export const updateSubmission = async (req, res) => {
  const { id } = req.params;
  const payload = req.body;

  try {
    const existing = await pool.query(
      'SELECT id, contractor_data, event_data, payment_data, witness_data FROM form_submissions WHERE id = $1 AND archived = false AND deleted_at IS NULL',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    const current = existing.rows[0];
    
    const contractor_data = {
      ...current.contractor_data,
      ...(payload.contractor_data || {})
    };
    const event_data = {
      ...current.event_data,
      ...(payload.event_data || {})
    };
    const payment_data = {
      ...current.payment_data,
      ...(payload.payment_data || {})
    };
    const witness_data = {
      ...current.witness_data,
      ...(payload.witness_data || {})
    };

    const updateHasUpdatedAt = await hasFormSubmissionUpdatedAt();

    const result = await pool.query(
      `
        UPDATE form_submissions
        SET contractor_data = $1,
            event_data = $2,
            payment_data = $3,
            witness_data = $4
            ${updateHasUpdatedAt ? ', updated_at = CURRENT_TIMESTAMP' : ''}
        WHERE id = $5
        RETURNING *
      `,
      [contractor_data, event_data, payment_data, witness_data, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('[Submissions] Error updating submission:', {
      message: error.message,
      code: error.code,
      submissionId: id,
    });
    res.status(500).json(process.env.NODE_ENV === 'production'
      ? errorResponse()
      : { error: 'Failed to update submission.' });
  }
};
