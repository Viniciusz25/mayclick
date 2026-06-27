-- Migration: 004_fix_generated_documents.sql
-- Description: Improve generated_documents table and add indexes

-- Ensure the table exists (idempotency)
CREATE TABLE IF NOT EXISTS generated_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID REFERENCES form_submissions(id),
    document_type TEXT,
    pdf_path TEXT,
    file_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add column if it doesn't exist (if init was partial)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='generated_documents' AND column_name='file_name') THEN
        ALTER TABLE generated_documents ADD COLUMN file_name TEXT;
    END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_gen_docs_submission_id ON generated_documents(submission_id);
CREATE INDEX IF NOT EXISTS idx_gen_docs_created_at ON generated_documents(created_at DESC);

-- Ensure storage directory exists at runtime (handled in controller, but noted here)
