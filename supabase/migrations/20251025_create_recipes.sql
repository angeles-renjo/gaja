-- Create recipes table
CREATE TABLE recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create recipe_ingredients table
CREATE TABLE recipe_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_name VARCHAR(255) NOT NULL,
  weight VARCHAR(100) NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index on recipe_id for faster lookups
CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);

-- Create index on order_index for sorting
CREATE INDEX idx_recipe_ingredients_order ON recipe_ingredients(recipe_id, order_index);

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample recipes for testing
INSERT INTO recipes (name, instructions) VALUES
  ('Chocolate Chip Cookies', 'Preheat oven to 375°F. Mix dry ingredients. Cream butter and sugars. Add eggs and vanilla. Combine wet and dry ingredients. Fold in chocolate chips. Bake for 10-12 minutes.'),
  ('Simple Tomato Pasta', 'Boil pasta according to package directions. Heat olive oil in a pan. Add garlic and cook until fragrant. Add crushed tomatoes and simmer. Season with salt, pepper, and basil. Toss with pasta.'),
  ('Classic Pancakes', 'Mix flour, sugar, baking powder, and salt. In another bowl, whisk eggs, milk, and melted butter. Combine wet and dry ingredients. Cook on griddle until bubbles form, then flip.');

-- Insert sample ingredients for the recipes
-- Chocolate Chip Cookies ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, weight, order_index)
SELECT id, 'All-purpose flour', '2 1/4 cups', 0 FROM recipes WHERE name = 'Chocolate Chip Cookies'
UNION ALL
SELECT id, 'Butter', '1 cup', 1 FROM recipes WHERE name = 'Chocolate Chip Cookies'
UNION ALL
SELECT id, 'White sugar', '3/4 cup', 2 FROM recipes WHERE name = 'Chocolate Chip Cookies'
UNION ALL
SELECT id, 'Brown sugar', '3/4 cup', 3 FROM recipes WHERE name = 'Chocolate Chip Cookies'
UNION ALL
SELECT id, 'Eggs', '2 large', 4 FROM recipes WHERE name = 'Chocolate Chip Cookies'
UNION ALL
SELECT id, 'Vanilla extract', '2 tsp', 5 FROM recipes WHERE name = 'Chocolate Chip Cookies'
UNION ALL
SELECT id, 'Baking soda', '1 tsp', 6 FROM recipes WHERE name = 'Chocolate Chip Cookies'
UNION ALL
SELECT id, 'Salt', '1 tsp', 7 FROM recipes WHERE name = 'Chocolate Chip Cookies'
UNION ALL
SELECT id, 'Chocolate chips', '2 cups', 8 FROM recipes WHERE name = 'Chocolate Chip Cookies';

-- Simple Tomato Pasta ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, weight, order_index)
SELECT id, 'Pasta', '1 lb', 0 FROM recipes WHERE name = 'Simple Tomato Pasta'
UNION ALL
SELECT id, 'Olive oil', '3 tbsp', 1 FROM recipes WHERE name = 'Simple Tomato Pasta'
UNION ALL
SELECT id, 'Garlic cloves, minced', '4 cloves', 2 FROM recipes WHERE name = 'Simple Tomato Pasta'
UNION ALL
SELECT id, 'Crushed tomatoes', '28 oz can', 3 FROM recipes WHERE name = 'Simple Tomato Pasta'
UNION ALL
SELECT id, 'Fresh basil', '1/4 cup', 4 FROM recipes WHERE name = 'Simple Tomato Pasta'
UNION ALL
SELECT id, 'Salt', 'to taste', 5 FROM recipes WHERE name = 'Simple Tomato Pasta'
UNION ALL
SELECT id, 'Black pepper', 'to taste', 6 FROM recipes WHERE name = 'Simple Tomato Pasta';

-- Classic Pancakes ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, weight, order_index)
SELECT id, 'All-purpose flour', '1 1/2 cups', 0 FROM recipes WHERE name = 'Classic Pancakes'
UNION ALL
SELECT id, 'Sugar', '2 tbsp', 1 FROM recipes WHERE name = 'Classic Pancakes'
UNION ALL
SELECT id, 'Baking powder', '2 tsp', 2 FROM recipes WHERE name = 'Classic Pancakes'
UNION ALL
SELECT id, 'Salt', '1/2 tsp', 3 FROM recipes WHERE name = 'Classic Pancakes'
UNION ALL
SELECT id, 'Milk', '1 1/4 cups', 4 FROM recipes WHERE name = 'Classic Pancakes'
UNION ALL
SELECT id, 'Eggs', '2 large', 5 FROM recipes WHERE name = 'Classic Pancakes'
UNION ALL
SELECT id, 'Melted butter', '3 tbsp', 6 FROM recipes WHERE name = 'Classic Pancakes';
