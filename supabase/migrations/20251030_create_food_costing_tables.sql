-- Create master_ingredients table
CREATE TABLE master_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ingredient_name VARCHAR(255) NOT NULL,
  weight DECIMAL(10, 2) NOT NULL, -- in grams or mL
  unit VARCHAR(10) NOT NULL CHECK (unit IN ('g', 'mL')),
  purchase_price DECIMAL(10, 2) NOT NULL,
  price_per_unit DECIMAL(10, 6) GENERATED ALWAYS AS (purchase_price / weight) STORED,
  notes TEXT,
  date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create costing_recipes table (separate from the regular recipes)
CREATE TABLE costing_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_name VARCHAR(255) NOT NULL,
  servings INTEGER,
  total_cost DECIMAL(10, 2) DEFAULT 0,
  cost_per_serving DECIMAL(10, 4) GENERATED ALWAYS AS (
    CASE
      WHEN servings > 0 THEN total_cost / servings
      ELSE 0
    END
  ) STORED,
  date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create costing_recipe_ingredients table (links costing recipes to master ingredients)
CREATE TABLE costing_recipe_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES costing_recipes(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES master_ingredients(id) ON DELETE RESTRICT,
  quantity DECIMAL(10, 2) NOT NULL, -- how much used in g or mL
  unit VARCHAR(10) NOT NULL CHECK (unit IN ('g', 'mL')),
  price_per_unit_snapshot DECIMAL(10, 6) NOT NULL, -- snapshot of price at time of adding
  cost DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * price_per_unit_snapshot) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for faster lookups
CREATE INDEX idx_master_ingredients_name ON master_ingredients(ingredient_name);
CREATE INDEX idx_costing_recipe_ingredients_recipe_id ON costing_recipe_ingredients(recipe_id);
CREATE INDEX idx_costing_recipe_ingredients_ingredient_id ON costing_recipe_ingredients(ingredient_id);

-- Create trigger to auto-update updated_at timestamp for master_ingredients
CREATE TRIGGER update_master_ingredients_updated_at
  BEFORE UPDATE ON master_ingredients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to auto-update updated_at timestamp for costing_recipes
CREATE TRIGGER update_costing_recipes_updated_at
  BEFORE UPDATE ON costing_recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to recalculate recipe total cost
CREATE OR REPLACE FUNCTION recalculate_recipe_total_cost()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE costing_recipes
  SET total_cost = (
    SELECT COALESCE(SUM(cost), 0)
    FROM costing_recipe_ingredients
    WHERE recipe_id = COALESCE(NEW.recipe_id, OLD.recipe_id)
  )
  WHERE id = COALESCE(NEW.recipe_id, OLD.recipe_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to recalculate recipe total cost when ingredients change
CREATE TRIGGER recalculate_cost_on_ingredient_insert
  AFTER INSERT ON costing_recipe_ingredients
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_recipe_total_cost();

CREATE TRIGGER recalculate_cost_on_ingredient_update
  AFTER UPDATE ON costing_recipe_ingredients
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_recipe_total_cost();

CREATE TRIGGER recalculate_cost_on_ingredient_delete
  AFTER DELETE ON costing_recipe_ingredients
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_recipe_total_cost();
