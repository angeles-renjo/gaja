-- Add 'ea' (each/pieces) unit support to master ingredients and recipe ingredients
-- This allows tracking ingredients sold by count (e.g., eggs, individual items)

-- Update master_ingredients table to support 'ea' unit
ALTER TABLE master_ingredients
  DROP CONSTRAINT IF EXISTS master_ingredients_unit_check;

ALTER TABLE master_ingredients
  ADD CONSTRAINT master_ingredients_unit_check
  CHECK (unit IN ('g', 'mL', 'ea'));

-- Update costing_recipe_ingredients table to support 'ea' unit
ALTER TABLE costing_recipe_ingredients
  DROP CONSTRAINT IF EXISTS costing_recipe_ingredients_unit_check;

ALTER TABLE costing_recipe_ingredients
  ADD CONSTRAINT costing_recipe_ingredients_unit_check
  CHECK (unit IN ('g', 'mL', 'ea'));

-- Note: No changes to computation logic needed
-- The formula: price_per_unit = purchase_price / weight works identically for:
-- - g (grams): price per gram
-- - mL (milliliters): price per milliliter
-- - ea (each): price per piece/item
