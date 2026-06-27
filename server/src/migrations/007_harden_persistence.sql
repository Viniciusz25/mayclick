-- Migration: 007_harden_persistence.sql
-- Description: Ensure persistence schema supports submissions, budgets and generated documents in production

CREATE SEQUENCE IF NOT EXISTS budget_number_seq START WITH 1001;

ALTER TABLE form_submissions DROP CONSTRAINT IF EXISTS form_submissions_selected_package_id_fkey;

ALTER TABLE form_submissions
    ALTER COLUMN selected_package_id TYPE TEXT USING selected_package_id::TEXT;

ALTER TABLE form_submissions
    ADD COLUMN IF NOT EXISTS selected_package_name TEXT;

CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_number INTEGER NOT NULL UNIQUE DEFAULT nextval('budget_number_seq'),
    source_type TEXT NOT NULL DEFAULT 'manual',
    submission_id UUID REFERENCES form_submissions(id),
    client_name TEXT NOT NULL,
    client_phone TEXT,
    client_email TEXT,
    event_type TEXT,
    event_date TEXT,
    event_location TEXT,
    selected_package_id TEXT,
    selected_package_name TEXT,
    package_price NUMERIC DEFAULT 0,
    extras_data JSONB DEFAULT '[]',
    travel_data JSONB DEFAULT '{}',
    discount_data JSONB DEFAULT '{}',
    payment_data JSONB DEFAULT '{}',
    subtotal NUMERIC DEFAULT 0,
    total NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'draft',
    pdf_document_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE budgets ADD COLUMN IF NOT EXISTS budget_number INTEGER;
ALTER TABLE budgets ALTER COLUMN budget_number SET DEFAULT nextval('budget_number_seq');
UPDATE budgets SET budget_number = nextval('budget_number_seq') WHERE budget_number IS NULL;

ALTER TABLE budgets ADD COLUMN IF NOT EXISTS selected_package_id TEXT;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS selected_package_name TEXT;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS extras_data JSONB DEFAULT '[]';
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS travel_data JSONB DEFAULT '{}';
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS discount_data JSONB DEFAULT '{}';
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS payment_data JSONB DEFAULT '{}';
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS total NUMERIC DEFAULT 0;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX IF NOT EXISTS idx_budgets_budget_number ON budgets(budget_number);
CREATE INDEX IF NOT EXISTS idx_budgets_submission_id ON budgets(submission_id);
CREATE INDEX IF NOT EXISTS idx_budgets_created_at ON budgets(created_at DESC);

ALTER TABLE generated_documents ADD COLUMN IF NOT EXISTS budget_id UUID REFERENCES budgets(id);
ALTER TABLE generated_documents ADD COLUMN IF NOT EXISTS file_name TEXT;

CREATE INDEX IF NOT EXISTS idx_generated_documents_budget_id ON generated_documents(budget_id);
CREATE INDEX IF NOT EXISTS idx_generated_documents_type ON generated_documents(document_type);
