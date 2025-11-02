-- Add sell_price column to costing_recipes table
-- This enables profit and cost percentage calculations

ALTER TABLE costing_recipes
ADD COLUMN sell_price DECIMAL(10, 2);

-- Add comment for clarity
COMMENT ON COLUMN costing_recipes.sell_price IS 'Optional selling price for the recipe to calculate profit and cost percentage';
