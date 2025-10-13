-- Add ingredients and allergies columns to menu_items table
ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS ingredients TEXT[],
  ADD COLUMN IF NOT EXISTS allergies TEXT[];

-- Update existing menu items with sample ingredients and allergies
UPDATE menu_items SET
  ingredients = ARRAY['Beef patty', 'Lettuce', 'Tomato', 'Onion', 'Pickles', 'Special sauce', 'Sesame bun'],
  allergies = ARRAY['Gluten', 'Dairy', 'Soy']
WHERE name = 'Classic Burger';

UPDATE menu_items SET
  ingredients = ARRAY['Pizza dough', 'Tomato sauce', 'Fresh mozzarella', 'Fresh basil', 'Extra virgin olive oil'],
  allergies = ARRAY['Gluten', 'Dairy']
WHERE name = 'Margherita Pizza';

UPDATE menu_items SET
  ingredients = ARRAY['Romaine lettuce', 'Parmesan cheese', 'Croutons', 'Caesar dressing', 'Lemon'],
  allergies = ARRAY['Gluten', 'Dairy', 'Egg', 'Fish']
WHERE name = 'Caesar Salad';

UPDATE menu_items SET
  ingredients = ARRAY['Grilled chicken breast', 'Avocado', 'Chipotle mayo', 'Lettuce', 'Tomato', 'Ciabatta bun'],
  allergies = ARRAY['Gluten', 'Egg']
WHERE name = 'Grilled Chicken Sandwich';

UPDATE menu_items SET
  ingredients = ARRAY['Battered cod', 'French fries', 'Tartar sauce', 'Lemon', 'Malt vinegar'],
  allergies = ARRAY['Fish', 'Gluten', 'Egg']
WHERE name = 'Fish and Chips';

UPDATE menu_items SET
  ingredients = ARRAY['Spaghetti', 'Bacon', 'Egg yolk', 'Parmesan cheese', 'Black pepper', 'Garlic'],
  allergies = ARRAY['Gluten', 'Dairy', 'Egg', 'Pork']
WHERE name = 'Pasta Carbonara';

UPDATE menu_items SET
  ingredients = ARRAY['Grilled zucchini', 'Bell peppers', 'Eggplant', 'Hummus', 'Spinach', 'Whole wheat tortilla'],
  allergies = ARRAY['Gluten', 'Sesame']
WHERE name = 'Veggie Wrap';

UPDATE menu_items SET
  ingredients = ARRAY['Ribeye steak', 'French fries', 'Herb butter', 'Sea salt', 'Black pepper'],
  allergies = ARRAY['Dairy']
WHERE name = 'Steak Frites';

-- Beverages typically have fewer ingredients/allergies
UPDATE menu_items SET
  ingredients = ARRAY['Carbonated water', 'High fructose corn syrup', 'Caramel color', 'Natural flavors'],
  allergies = ARRAY[]::TEXT[]
WHERE name = 'Coca Cola';

UPDATE menu_items SET
  ingredients = ARRAY['Carbonated water', 'High fructose corn syrup', 'Citric acid', 'Natural lemon-lime flavor'],
  allergies = ARRAY[]::TEXT[]
WHERE name = 'Sprite';

UPDATE menu_items SET
  ingredients = ARRAY['Fresh oranges'],
  allergies = ARRAY[]::TEXT[]
WHERE name = 'Orange Juice';

UPDATE menu_items SET
  ingredients = ARRAY['Arabica coffee beans', 'Water'],
  allergies = ARRAY[]::TEXT[]
WHERE name = 'Coffee';

UPDATE menu_items SET
  ingredients = ARRAY['Black tea', 'Water', 'Sugar (optional)', 'Lemon (optional)'],
  allergies = ARRAY[]::TEXT[]
WHERE name = 'Iced Tea';

UPDATE menu_items SET
  ingredients = ARRAY['Purified water', 'Natural minerals (if sparkling)'],
  allergies = ARRAY[]::TEXT[]
WHERE name = 'Water';

UPDATE menu_items SET
  ingredients = ARRAY['Water', 'Barley', 'Hops', 'Yeast'],
  allergies = ARRAY['Gluten']
WHERE name = 'Beer';

UPDATE menu_items SET
  ingredients = ARRAY['Grapes', 'Yeast', 'Sulfites'],
  allergies = ARRAY['Sulfites']
WHERE name = 'House Wine';
