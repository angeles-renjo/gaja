-- Rollback: Remove RLS policies from costing tables

-- Drop Costing Recipe Ingredients Policies
DROP POLICY IF EXISTS "Anyone can view costing recipe ingredients" ON costing_recipe_ingredients;
DROP POLICY IF EXISTS "Authenticated users can insert recipe ingredients" ON costing_recipe_ingredients;
DROP POLICY IF EXISTS "Authenticated users can update recipe ingredients" ON costing_recipe_ingredients;
DROP POLICY IF EXISTS "Authenticated users can delete recipe ingredients" ON costing_recipe_ingredients;

-- Drop Costing Recipes Policies
DROP POLICY IF EXISTS "Anyone can view costing recipes" ON costing_recipes;
DROP POLICY IF EXISTS "Authenticated users can insert costing recipes" ON costing_recipes;
DROP POLICY IF EXISTS "Authenticated users can update costing recipes" ON costing_recipes;
DROP POLICY IF EXISTS "Authenticated users can delete costing recipes" ON costing_recipes;

-- Drop Master Ingredients Policies
DROP POLICY IF EXISTS "Anyone can view master ingredients" ON master_ingredients;
DROP POLICY IF EXISTS "Authenticated users can insert master ingredients" ON master_ingredients;
DROP POLICY IF EXISTS "Authenticated users can update master ingredients" ON master_ingredients;
DROP POLICY IF EXISTS "Authenticated users can delete master ingredients" ON master_ingredients;

-- Disable Row Level Security on costing tables
ALTER TABLE costing_recipe_ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE costing_recipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE master_ingredients DISABLE ROW LEVEL SECURITY;
