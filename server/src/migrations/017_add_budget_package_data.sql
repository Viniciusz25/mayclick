-- Migration: 017_add_budget_package_data.sql
-- Description: Store a package snapshot with saved budgets.

ALTER TABLE budgets
  ADD COLUMN IF NOT EXISTS package_data JSONB DEFAULT '{}';
