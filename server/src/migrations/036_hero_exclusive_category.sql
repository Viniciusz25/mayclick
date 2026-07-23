-- Migration: 036_hero_exclusive_category.sql
-- Description: Add is_hidden_from_portfolio field to portfolio_categories to allow exclusive hero categories

ALTER TABLE portfolio_categories
  ADD COLUMN IF NOT EXISTS is_hidden_from_portfolio BOOLEAN DEFAULT FALSE;
