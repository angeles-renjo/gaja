-- Increase decimal precision for food costing tables
-- Using DECIMAL(16, 6) to allow up to 10 digits before decimal and 6 after

-- Step 1: Drop generated columns that depend on the columns we want to alter
ALTER TABLE master_ingredients DROP COLUMN price_per_unit;
ALTER TABLE costing_recipe_ingredients DROP COLUMN cost;

-- Step 2: Update column types in master_ingredients table
ALTER TABLE master_ingredients
  ALTER COLUMN weight TYPE DECIMAL(16, 6),
  ALTER COLUMN purchase_price TYPE DECIMAL(16, 6);

-- Step 3: Update column type in costing_recipe_ingredients table
ALTER TABLE costing_recipe_ingredients
  ALTER COLUMN quantity TYPE DECIMAL(16, 6);

-- Step 4: Recreate the generated columns with updated precision
ALTER TABLE master_ingredients
  ADD COLUMN price_per_unit DECIMAL(16, 6) GENERATED ALWAYS AS (purchase_price / weight) STORED;

ALTER TABLE costing_recipe_ingredients
  ADD COLUMN cost DECIMAL(16, 6) GENERATED ALWAYS AS (quantity * price_per_unit_snapshot) STORED;
