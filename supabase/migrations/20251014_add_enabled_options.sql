-- 20251014_add_enabled_options.sql
-- Purpose: Add per-item dietary options column (no price impact)

BEGIN;

-- Add enabled_options column to menu_items to indicate which dietary toggles
-- (e.g., "vegan", "vegetarian", "dairy_free") are available for a dish.
-- Using text[] keeps it simple; nulls avoided via NOT NULL + default empty array.
ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS enabled_options text[] NOT NULL DEFAULT '{}'::text[];

-- Optional documentation
COMMENT ON COLUMN menu_items.enabled_options IS 'List of supported option keys for this item (e.g., vegan, vegetarian, dairy_free)';

COMMIT;
