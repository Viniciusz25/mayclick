-- Migration: 031_budget_contract
-- Description: Add contract_document_id to budgets table

ALTER TABLE budgets ADD COLUMN IF NOT EXISTS contract_document_id UUID REFERENCES generated_documents(id) ON DELETE SET NULL;
