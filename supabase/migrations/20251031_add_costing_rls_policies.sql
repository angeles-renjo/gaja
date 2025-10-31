-- Enable Row Level Security on costing tables
ALTER TABLE master_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE costing_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE costing_recipe_ingredients ENABLE ROW LEVEL SECURITY;

-- Master Ingredients Policies
-- Allow authenticated users to read all master ingredients
CREATE POLICY "Anyone can view master ingredients"
  ON master_ingredients
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert master ingredients
CREATE POLICY "Authenticated users can insert master ingredients"
  ON master_ingredients
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update their own master ingredients
CREATE POLICY "Authenticated users can update master ingredients"
  ON master_ingredients
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to delete master ingredients if not used in recipes
CREATE POLICY "Authenticated users can delete master ingredients"
  ON master_ingredients
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Costing Recipes Policies
-- Allow authenticated users to read all costing recipes
CREATE POLICY "Anyone can view costing recipes"
  ON costing_recipes
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert costing recipes
CREATE POLICY "Authenticated users can insert costing recipes"
  ON costing_recipes
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update costing recipes
CREATE POLICY "Authenticated users can update costing recipes"
  ON costing_recipes
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to delete costing recipes
CREATE POLICY "Authenticated users can delete costing recipes"
  ON costing_recipes
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Costing Recipe Ingredients Policies
-- Allow authenticated users to read all recipe ingredients
CREATE POLICY "Anyone can view costing recipe ingredients"
  ON costing_recipe_ingredients
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert recipe ingredients
CREATE POLICY "Authenticated users can insert recipe ingredients"
  ON costing_recipe_ingredients
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update recipe ingredients
CREATE POLICY "Authenticated users can update recipe ingredients"
  ON costing_recipe_ingredients
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to delete recipe ingredients
CREATE POLICY "Authenticated users can delete recipe ingredients"
  ON costing_recipe_ingredients
  FOR DELETE
  USING (auth.role() = 'authenticated');
