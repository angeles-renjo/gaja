-- Create tables table
CREATE TABLE IF NOT EXISTS tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number INTEGER UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('food', 'beverage')),
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES tables(id),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'completed', 'cancelled')),
  total_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_order DECIMAL(10, 2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(available);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to orders table
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample tables (Table 1-10)
INSERT INTO tables (table_number) VALUES
  (1), (2), (3), (4), (5), (6), (7), (8), (9), (10)
ON CONFLICT (table_number) DO NOTHING;

-- Insert sample menu items
INSERT INTO menu_items (name, description, price, category, available) VALUES
  -- Food items
  ('Classic Burger', 'Beef patty with lettuce, tomato, and special sauce', 12.99, 'food', true),
  ('Margherita Pizza', 'Fresh mozzarella, basil, and tomato sauce', 14.99, 'food', true),
  ('Caesar Salad', 'Romaine lettuce, parmesan, croutons, and Caesar dressing', 9.99, 'food', true),
  ('Grilled Chicken Sandwich', 'Grilled chicken breast with avocado and chipotle mayo', 11.99, 'food', true),
  ('Fish and Chips', 'Battered cod with fries and tartar sauce', 15.99, 'food', true),
  ('Pasta Carbonara', 'Spaghetti with bacon, egg, and parmesan', 13.99, 'food', true),
  ('Veggie Wrap', 'Grilled vegetables with hummus in a tortilla wrap', 10.99, 'food', true),
  ('Steak Frites', 'Grilled ribeye with french fries', 24.99, 'food', true),

  -- Beverage items
  ('Coca Cola', 'Classic Coca Cola', 2.99, 'beverage', true),
  ('Sprite', 'Lemon-lime soda', 2.99, 'beverage', true),
  ('Orange Juice', 'Freshly squeezed orange juice', 4.99, 'beverage', true),
  ('Coffee', 'Freshly brewed coffee', 3.49, 'beverage', true),
  ('Iced Tea', 'Sweet or unsweetened', 2.99, 'beverage', true),
  ('Water', 'Still or sparkling', 1.99, 'beverage', true),
  ('Beer', 'Domestic draft beer', 5.99, 'beverage', true),
  ('House Wine', 'Red or white wine', 7.99, 'beverage', true)
ON CONFLICT DO NOTHING;
