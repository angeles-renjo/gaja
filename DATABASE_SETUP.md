# Database Setup Guide

This project uses Supabase with proper migrations management.

## Initial Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish setting up
3. Go to Project Settings → API
4. Copy your project URL and anon key

### 2. Configure Environment Variables

Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Link to Your Supabase Project

```bash
npx supabase login
npx supabase link --project-ref your-project-ref
```

You can find your project ref in the Supabase dashboard URL:
`https://supabase.com/dashboard/project/[your-project-ref]`

### 4. Push Migrations to Supabase

```bash
npm run db:push
```

This will:
- Create all tables (tables, menu_items, orders, order_items)
- Set up indexes for performance
- Create triggers for automatic timestamp updates
- Insert sample tables (1-10)
- Insert sample menu items (8 food items, 8 beverages)

## Database Schema

### Tables

**tables**
- `id` (UUID, primary key)
- `table_number` (integer, unique)
- `created_at` (timestamp)

**menu_items**
- `id` (UUID, primary key)
- `name` (varchar)
- `description` (text)
- `price` (decimal)
- `category` (food | beverage)
- `image_url` (text, optional)
- `available` (boolean)
- `created_at` (timestamp)

**orders**
- `id` (UUID, primary key)
- `table_id` (UUID, references tables)
- `status` (pending | preparing | completed | cancelled)
- `total_amount` (decimal)
- `created_at` (timestamp)
- `updated_at` (timestamp, auto-updated)

**order_items**
- `id` (UUID, primary key)
- `order_id` (UUID, references orders)
- `menu_item_id` (UUID, references menu_items)
- `quantity` (integer)
- `price_at_order` (decimal)
- `special_instructions` (text, optional)
- `created_at` (timestamp)

## Useful Commands

```bash
# Push migrations to Supabase
npm run db:push

# Reset database (caution: deletes all data)
npm run db:reset

# Create a new migration
npm run db:migration:new your_migration_name
```

## Next Steps

After running migrations:
1. Verify tables are created in Supabase dashboard → Table Editor
2. Check that sample menu items are inserted
3. Start the development server: `npm run dev`
