-- Migration: 002_add_file_name_to_documents.sql
-- Description: Add file_name column to generated_documents table

ALTER TABLE generated_documents ADD COLUMN IF NOT EXISTS file_name TEXT;
