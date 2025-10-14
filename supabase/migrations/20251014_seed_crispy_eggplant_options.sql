-- 20251014_seed_crispy_eggplant_options.sql
-- Example: enable Vegan, Vegetarian, and Dairy-free options for Crispy Eggplant

BEGIN;

UPDATE menu_items
SET enabled_options = ARRAY['vegan','vegetarian','dairy_free']::text[]
WHERE name = 'Crispy Eggplant';

COMMIT;
