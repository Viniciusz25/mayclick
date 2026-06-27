import pool from '../db.js';

const STANDARD_CATEGORIES = ['infantil', 'debutante', 'casamento'];

const sanitizeError = (error) => ({
  message: error.message,
  code: error.code,
});

const defaultError = () => ({ error: 'Erro interno ao processar a solicitacao.' });

const safeArray = (value) => {
  if (Array.isArray(value)) return value.filter((item) => item != null);
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.filter((item) => item != null);
    } catch {
      // Legacy multiline text is still accepted.
    }

    return trimmed
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (value == null) return [];
  return [value];
};

const normalizeFeature = (feature) => {
  if (feature && typeof feature === 'object' && !Array.isArray(feature)) {
    const label = String(feature.label || feature.name || feature.value || feature.detail || '').trim();
    if (!label) return null;

    const rawValue = feature.value ?? feature.detail ?? '';
    const type = ['boolean', 'text'].includes(feature.type) ? feature.type : (rawValue ? 'text' : 'boolean');

    return {
      label,
      type,
      included: feature.included === undefined ? true : Boolean(feature.included),
      value: rawValue == null ? '' : String(rawValue),
    };
  }

  const label = String(feature || '').trim();
  return label ? { label, type: 'boolean', included: true, value: '' } : null;
};

const normalizeFeatureList = (features) => {
  return safeArray(features).map(normalizeFeature).filter(Boolean);
};

const normalizePackagePayload = (payload = {}) => {
  const price = Number(payload.price ?? 0);
  const sortOrder = Number.parseInt(payload.sort_order ?? payload.sortOrder ?? 0, 10);
  const features = normalizeFeatureList(payload.features);
  const comparisonItems = normalizeFeatureList(payload.comparison_items ?? payload.comparisonItems ?? payload.features);

  const rawCategory = String(payload.category || '').trim();
  const normalizedCategory = STANDARD_CATEGORIES.find(
    (category) => category.toLowerCase() === rawCategory.toLowerCase()
  ) || rawCategory;

  return {
    category: normalizedCategory,
    name: String(payload.name || '').trim(),
    label: payload.label == null ? '' : String(payload.label),
    package_number: payload.package_number == null
      ? (payload.packageNumber == null ? '' : String(payload.packageNumber))
      : String(payload.package_number),
    installment_text: payload.installment_text == null
      ? (payload.installmentText == null ? '' : String(payload.installmentText))
      : String(payload.installment_text),
    description: payload.description == null ? '' : String(payload.description),
    features,
    comparison_items: comparisonItems,
    coverage_time: payload.coverage_time == null ? '' : String(payload.coverage_time),
    team: payload.team == null ? '' : String(payload.team),
    deliveries: payload.deliveries == null ? '' : String(payload.deliveries),
    differential: payload.differential == null ? '' : String(payload.differential),
    observations: payload.observations == null
      ? (payload.notes == null ? '' : String(payload.notes))
      : String(payload.observations),
    price: Number.isFinite(price) ? price : 0,
    active: payload.active === undefined ? true : Boolean(payload.active),
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
  };
};

const validatePackage = (pkg) => {
  const errors = [];

  if (!pkg.category) errors.push('category is required.');
  if (!pkg.name) errors.push('name is required.');
  if (pkg.name.length > 160) errors.push('name is too long.');
  if (pkg.price < 0) errors.push('price must be zero or greater.');
  if (!Array.isArray(pkg.features)) errors.push('features must be an array.');

  return errors;
};

const packageSelectFields = `
  id, category, name, label, package_number, installment_text, description, features, comparison_items,
  coverage_time, team, deliveries, differential, observations,
  price, active, sort_order, archived, deleted_at, created_at, updated_at
`;

const getExistingColumns = async (tableName, columnNames) => {
  const result = await pool.query(
    `
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name = ANY($2::text[])
    `,
    [tableName, columnNames]
  );

  return result.rows.reduce((columns, row) => {
    columns[row.column_name] = row.data_type;
    return columns;
  }, {});
};

const ensurePackageArchiveColumns = async () => {
  await pool.query(`
    ALTER TABLE packages
      ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

    ALTER TABLE packages
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

    UPDATE packages
    SET archived = FALSE
    WHERE archived IS NULL;

    ALTER TABLE packages
      ALTER COLUMN archived SET DEFAULT FALSE;

    ALTER TABLE packages
      ALTER COLUMN archived SET NOT NULL;
  `);
};

const countPackageUsage = async ({ id, name }) => {
  const usage = {
    submissions: 0,
    budgets: 0,
    checkFailed: false,
  };

  try {
    const submissionColumns = await getExistingColumns('form_submissions', [
      'selected_package_id',
      'selected_package_name',
    ]);
    const submissionClauses = [];

    if (submissionColumns.selected_package_id) {
      submissionClauses.push('selected_package_id::text = $1');
    }
    if (submissionColumns.selected_package_name) {
      submissionClauses.push('lower(selected_package_name) = lower($2)');
    }

    if (submissionClauses.length > 0) {
      const result = await pool.query(
        `SELECT COUNT(*)::int AS count FROM form_submissions WHERE ${submissionClauses.join(' OR ')}`,
        [id, name]
      );
      usage.submissions = Number(result.rows[0]?.count || 0);
    }
  } catch (error) {
    usage.checkFailed = true;
    console.warn('Package usage check skipped for form_submissions:', sanitizeError(error));
  }

  try {
    const budgetColumns = await getExistingColumns('budgets', [
      'selected_package_id',
      'selected_package_name',
      'package_data',
    ]);
    const budgetClauses = [];

    if (budgetColumns.selected_package_id) {
      budgetClauses.push('selected_package_id::text = $1');
    }
    if (budgetColumns.selected_package_name) {
      budgetClauses.push('lower(selected_package_name) = lower($2)');
    }
    if (['json', 'jsonb'].includes(budgetColumns.package_data)) {
      budgetClauses.push("package_data->>'id' = $1");
      budgetClauses.push("lower(package_data->>'name') = lower($2)");
    }

    if (budgetClauses.length > 0) {
      const result = await pool.query(
        `SELECT COUNT(*)::int AS count FROM budgets WHERE ${budgetClauses.join(' OR ')}`,
        [id, name]
      );
      usage.budgets = Number(result.rows[0]?.count || 0);
    }
  } catch (error) {
    usage.checkFailed = true;
    console.warn('Package usage check skipped for budgets:', sanitizeError(error));
  }

  return usage;
};

export const getPublicPackages = async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT ${packageSelectFields}
        FROM packages
        WHERE active = true
          AND archived = false
          AND deleted_at IS NULL
        ORDER BY sort_order ASC, category ASC, name ASC
      `
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching public packages:', sanitizeError(error));
    res.status(500).json(process.env.NODE_ENV === 'production'
      ? defaultError()
      : { error: 'Failed to fetch packages.' });
  }
};

export const getAllPackages = async (req, res) => {
  try {
    const includeDeleted = req.query.includeDeleted === 'true';
    const result = await pool.query(
      `
        SELECT ${packageSelectFields}
        FROM packages
        ${includeDeleted ? '' : 'WHERE deleted_at IS NULL AND archived = false'}
        ORDER BY sort_order ASC, category ASC, name ASC
      `
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching admin packages:', sanitizeError(error));
    res.status(500).json(process.env.NODE_ENV === 'production'
      ? defaultError()
      : { error: 'Failed to fetch admin packages.' });
  }
};

export const getPackageById = async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT ${packageSelectFields}
        FROM packages
        WHERE id = $1
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Package not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching package:', sanitizeError(error));
    res.status(500).json(process.env.NODE_ENV === 'production'
      ? defaultError()
      : { error: 'Failed to fetch package.' });
  }
};

export const createPackage = async (req, res) => {
  const pkg = normalizePackagePayload(req.body);
  const errors = validatePackage(pkg);

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(' ') });
  }

  try {
    const result = await pool.query(
      `
        INSERT INTO packages
        (category, name, label, package_number, installment_text, description, features, comparison_items, coverage_time,
         team, deliveries, differential, observations, price, active, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *
      `,
      [
        pkg.category,
        pkg.name,
        pkg.label,
        pkg.package_number,
        pkg.installment_text,
        pkg.description,
        JSON.stringify(pkg.features),
        JSON.stringify(pkg.comparison_items),
        pkg.coverage_time,
        pkg.team,
        pkg.deliveries,
        pkg.differential,
        pkg.observations,
        pkg.price,
        pkg.active,
        pkg.sort_order,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating package:', sanitizeError(error));
    res.status(500).json(process.env.NODE_ENV === 'production'
      ? defaultError()
      : { error: 'Failed to create package.' });
  }
};

export const updatePackage = async (req, res) => {
  const { id } = req.params;
  const pkg = normalizePackagePayload(req.body);
  const errors = validatePackage(pkg);

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(' ') });
  }

  try {
    const result = await pool.query(
      `
        UPDATE packages SET
          category = $1,
          name = $2,
          label = $3,
          package_number = $4,
          installment_text = $5,
          description = $6,
          features = $7::jsonb,
          comparison_items = $8::jsonb,
          coverage_time = $9,
          team = $10,
          deliveries = $11,
          differential = $12,
          observations = $13,
          price = $14,
          active = $15,
          sort_order = $16,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $17
          AND deleted_at IS NULL
          AND archived = false
        RETURNING *
      `,
      [
        pkg.category,
        pkg.name,
        pkg.label,
        pkg.package_number,
        pkg.installment_text,
        pkg.description,
        JSON.stringify(pkg.features),
        JSON.stringify(pkg.comparison_items),
        pkg.coverage_time,
        pkg.team,
        pkg.deliveries,
        pkg.differential,
        pkg.observations,
        pkg.price,
        pkg.active,
        pkg.sort_order,
        id,
      ]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Package not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating package:', sanitizeError(error));
    res.status(500).json(process.env.NODE_ENV === 'production'
      ? defaultError()
      : { error: 'Failed to update package.' });
  }
};

export const deletePackage = async (req, res) => {
  const { id } = req.params;
  try {
    await ensurePackageArchiveColumns();

    const existing = await pool.query('SELECT id::text AS id, name FROM packages WHERE id::text = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Package not found.' });

    const pkg = existing.rows[0];
    const usage = await countPackageUsage({ id: pkg.id, name: pkg.name });
    const submissionsCount = usage.submissions;
    const budgetsCount = usage.budgets;
    const hasHistoricalUse = submissionsCount > 0 || budgetsCount > 0;

    const result = await pool.query(
      `
        UPDATE packages
        SET active = false,
            archived = true,
            deleted_at = COALESCE(deleted_at, CURRENT_TIMESTAMP),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `,
      [id]
    );

    res.json({
      ...result.rows[0],
      deleted: true,
      archived: true,
      message: hasHistoricalUse
        ? 'Pacote arquivado para preservar histórico.'
        : 'Pacote excluído da interface com sucesso.',
      usage: {
        submissions: submissionsCount,
        budgets: budgetsCount,
        checkFailed: usage.checkFailed,
      },
    });
  } catch (error) {
    console.error('Error deleting package:', sanitizeError(error));
    res.status(500).json(process.env.NODE_ENV === 'production'
      ? defaultError()
      : { error: 'Failed to delete package.' });
  }
};

export const togglePackageActive = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'UPDATE packages SET active = NOT active, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL AND archived = false RETURNING *',
      [id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Package not found.' });

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error toggling package:', sanitizeError(error));
    res.status(500).json(process.env.NODE_ENV === 'production'
      ? defaultError()
      : { error: 'Failed to toggle package.' });
  }
};
