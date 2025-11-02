-- Rollback: Remove sell_price column from costing_recipes table
-- This reverts the changes made in 20251104_add_sell_price_to_recipes.sql

ALTER TABLE costing_recipes
DROP COLUMN IF EXISTS sell_price;
