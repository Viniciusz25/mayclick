-- Migration: 004_create_budgets.sql
-- Description: Create budgets table and link to generated_documents

CREATE SEQUENCE IF NOT EXISTS budget_number_seq START WITH 1001;

CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_number INTEGER NOT NULL UNIQUE DEFAULT nextval('budget_number_seq'),
    source_type TEXT NOT NULL, -- 'manual', 'submission'
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
    status TEXT DEFAULT 'draft', -- 'draft', 'generated', 'sent', 'approved', 'cancelled'
    pdf_document_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Link generated_documents to budgets
ALTER TABLE generated_documents ADD COLUMN IF NOT EXISTS budget_id UUID REFERENCES budgets(id);

-- Update trigger for updated_at
DROP TRIGGER IF EXISTS update_budgets_updated_at ON budgets;
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
