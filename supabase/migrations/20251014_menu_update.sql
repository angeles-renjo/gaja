-- menu_update_20251014.sql
-- Purpose: Safely update current menu items provided so far.
-- Default: Safe replace (mark all unavailable, then upsert this list to available=true).
-- Alternate: Upsert-only block provided below (commented out). Use one approach.

-- =============================================
-- OPTION A1: SAFE REPLACE (ACTIVE)
-- Marks all existing items unavailable, then upserts these to available=true
-- =============================================
BEGIN;

-- Ensure unique constraint on name exists (idempotent)
ALTER TABLE menu_items
  ADD CONSTRAINT IF NOT EXISTS uq_menu_items_name UNIQUE (name);

-- Mark all existing items unavailable
UPDATE menu_items SET available = false;

-- Upsert the provided items
INSERT INTO menu_items (name, description, price, category, available, image_url, ingredients, allergies)
VALUES
  -- Signature and Favorites
  ('Nom Nom Chicken', '', 0.00, 'food', true, NULL, ARRAY[]::text[], ARRAY[]::text[]),
  ('Membosha', '', 0.00, 'food', true, NULL, ARRAY[]::text[], ARRAY[]::text[]),
  ('Crispy Eggplant', '', 0.00, 'food', true, NULL, ARRAY[]::text[], ARRAY[]::text[]),
  ('Kimchi Fried Rice', '', 0.00, 'food', true, NULL, ARRAY[]::text[], ARRAY[]::text[]),
  ('Pork Belly', '', 0.00, 'food', true, NULL, ARRAY[]::text[], ARRAY[]::text[]),

  -- Plates & Bites
  ('Spicy Gochujang Chicken Skewers', '', 0.00, 'food', true, NULL, ARRAY[]::text[], ARRAY[]::text[]),
  ('Oi Cucumber', '', 0.00, 'food', true, NULL, ARRAY[]::text[], ARRAY[]::text[]),
  ('Pork and Chive Dumplings', '', 0.00, 'food', true, NULL, ARRAY[]::text[], ARRAY[]::text[]),
  ('Charred Green', '', 0.00, 'food', true, NULL, ARRAY[]::text[], ARRAY[]::text[]),
  ('Ddukboki', '', 0.00, 'food', true, NULL, ARRAY[]::text[], ARRAY[]::text[]),
  ('Gochu-Ika', '', 0.00, 'food', true, NULL, ARRAY[]::text[], ARRAY[]::text[]),

  -- Big & Sizzling
  ('Gochujang Ribs', '', 0.00, 'food', true, NULL, ARRAY[]::text[], ARRAY[]::text[]),
  ('Ssiba Chicken', '', 0.00, 'food', true, NULL, ARRAY[]::text[], ARRAY[]::text[]),
  ('Bulgogi Hotpot', '', 0.00, 'food', true, NULL, ARRAY[]::text[], ARRAY[]::text[]),
  ('Mushroom Madu Pot', '', 0.00, 'food', true, NULL, ARRAY[]::text[], ARRAY[]::text[])
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  category = EXCLUDED.category,
  available = EXCLUDED.available;

COMMIT;

-- =============================================
-- OPTION B: UPSERT ONLY (COMMENTED OUT)
-- Keeps existing items as-is; merges these by name
-- Uncomment to use instead of Option A1 above
-- =============================================
-- BEGIN;
-- ALTER TABLE menu_items
--   ADD CONSTRAINT IF NOT EXISTS uq_menu_items_name UNIQUE (name);
-- INSERT INTO menu_items (name, description, price, category, available, image_url, ingredients, allergies)
-- VALUES
--   ('Nom Nom Chicken', '', 0.00, 'food', true, NULL, ARRAY[]::text[], ARRAY[]::text[]),
--   ('Membosha', '', 0.00, 'food', true, NULL, ARRAY[]::text[], ARRAY[]::text[]),
--   ('Crispy Eggplant', '', 0.00, 'food', true, NULL, ARRAY[]::text[], ARRAY[]::text[]),
--   ('Kimchi Fried Rice', '', 0.00, 'food', true, NULL, ARRAY[]::text[], ARRAY[]::text[]),
--   ('Pork Belly', '', 0.00, 'food', true, NULL, ARRAY[]::text[], ARRAY[]::text[]),
--   ('Spicy Gochujang Chicken Skewers', '', 0.00, 'food', true, NULL, ARRAY[]::text[], ARRAY[]::text[]),
--   ('Oi Cucumber', '', 0.00, 'food', true, NULL, ARRAY[]::text[], ARRAY[]::text[]),
--   ('Pork and Chive Dumplings', '', 0.00, 'food', true, NULL, ARRAY[]::text[], ARRAY[]::text[]),
--   ('Charred Green', '', 0.00, 'food', true, NULL, ARRAY[]::text[], ARRAY[]::text[]),
--   ('Ddukboki', '', 0.00, 'food', true, NULL, ARRAY[]::text[], ARRAY[]::text[]),
--   ('Gochu-Ika', '', 0.00, 'food', true, NULL, ARRAY[]::text[], ARRAY[]::text[]),
--   ('Gochujang Ribs', '', 0.00, 'food', true, NULL, ARRAY[]::text[], ARRAY[]::text[]),
--   ('Ssiba Chicken', '', 0.00, 'food', true, NULL, ARRAY[]::text[], ARRAY[]::text[]),
--   ('Bulgogi Hotpot', '', 0.00, 'food', true, NULL, ARRAY[]::text[], ARRAY[]::text[]),
--   ('Mushroom Madu Pot', '', 0.00, 'food', true, NULL, ARRAY[]::text[], ARRAY[]::text[])
-- ON CONFLICT (name) DO UPDATE SET
--   description = EXCLUDED.description,
--   price = EXCLUDED.price,
--   category = EXCLUDED.category,
--   available = EXCLUDED.available;
-- COMMIT;
