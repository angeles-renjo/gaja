# Restaurant QR Ordering System

A serverless restaurant ordering system built with Next.js 14, Supabase, and Zustand. Customers scan QR codes at tables to view the menu and place orders directly from their phones.

## 🎯 Project Overview

**Phase 1** (Current): Core ordering system without thermal printers
- Customer scans QR → browses menu → adds to cart → submits order
- Orders stored in Supabase database
- View orders in admin dashboard

**Phase 2** (Future): Thermal printer integration
- Auto-print orders to kitchen/counter printers
- Network printer support

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand (with localStorage persistence)
- **Database**: Supabase (PostgreSQL)
- **Data Fetching**: Custom React hooks
- **QR Codes**: qrcode library

### Architecture Decisions

**Client-Side Rendering**
- No SSR for cost optimization and simplicity
- Direct Supabase queries from browser
- Static hosting compatible (Vercel free tier)

**Custom Hooks Pattern**
- `useMenu()` - Fetch menu items
- `useSubmitOrder()` - Handle order submission
- `useTableInfo()` - Get table information
- Keeps components clean and logic reusable

**State Management with Zustand**
- Cart state with localStorage persistence
- Order state (table info, submission status)
- Lightweight (~1KB), no prop drilling

## 📁 Project Structure

```
src/
├── app/
│   ├── order/          # Customer ordering page
│   ├── admin/          # Admin dashboard (TODO)
│   └── api/
│       └── print/      # Print endpoint placeholder (Phase 2)
├── components/
│   ├── Menu.tsx        # Menu display component
│   ├── Cart.tsx        # Shopping cart component
│   └── OrderConfirmation.tsx  # Success message (TODO)
├── hooks/
│   ├── useMenu.ts      # Fetch menu items
│   ├── useSubmitOrder.ts  # Submit orders
│   └── useTableInfo.ts # Get table info
├── stores/
│   ├── cart-store.ts   # Cart state (Zustand)
│   └── order-store.ts  # Order state (Zustand)
├── lib/
│   └── supabase.ts     # Supabase client
└── types/
    └── index.ts        # TypeScript types

supabase/
└── migrations/
    └── 20251011224852_initial_schema.sql  # Database schema
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm
- Supabase account

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd gaja
npm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key from Project Settings → API
3. Update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_RESTAURANT_NAME=Your Restaurant Name
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Push Database Migrations

```bash
# Login to Supabase CLI
npx supabase login

# Link to your project
npx supabase link --project-ref your-project-ref

# Push migrations
npm run db:push
```

This creates:
- `tables` - Restaurant tables (1-10)
- `menu_items` - Food and beverage items
- `orders` - Customer orders
- `order_items` - Order line items

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Test the Connection

```bash
node test-connection.js
```

Should show tables and menu items loaded successfully.

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database commands
npm run db:push      # Push migrations to Supabase
npm run db:reset     # Reset database (⚠️ deletes data)
npm run db:migration:new  # Create new migration
```

## 🔗 Database Schema

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for complete schema details.

**Key Tables:**
- `tables` - Restaurant table numbers
- `menu_items` - Menu with prices, categories (food/beverage)
- `orders` - Customer orders with status tracking
- `order_items` - Line items with special instructions

## 🎨 Features

### Phase 1 (Current)
- ✅ QR code generation for tables
- ✅ Mobile-friendly menu browsing
- ✅ Shopping cart with persistence
- ✅ Order submission to database
- ✅ Admin dashboard to view orders
- ✅ Real-time order status

### Phase 2 (Future)
- ⏳ Thermal printer integration (kitchen/counter)
- ⏳ Network printer support
- ⏳ Auto-print on order submission

## 🔐 Environment Variables

Required:
```env
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon key
```

Optional:
```env
NEXT_PUBLIC_RESTAURANT_NAME=     # Restaurant name (default: "My Restaurant")
NEXT_PUBLIC_BASE_URL=            # Base URL for QR codes (default: http://localhost:3000)
```

Phase 2 (Future):
```env
PRINTER_KITCHEN_IP=              # Kitchen printer IP
PRINTER_COUNTER_IP=              # Counter printer IP
```

## 📱 Usage Flow

1. **Generate QR Codes** - Run QR generation script for each table
2. **Print & Place** - Print QR codes and place on tables
3. **Customer Scans** - Opens order page with table ID
4. **Browse & Order** - Customer adds items and submits
5. **View Orders** - Admin dashboard shows all orders
6. **(Phase 2)** - Auto-print to kitchen/counter

## 🚢 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Deploy to Other Platforms

Compatible with any static hosting:
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront

## 📚 Documentation

- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database setup guide
- [PROGRESS.md](./PROGRESS.md) - Development progress tracker
- [development-workflow/](./development-workflow/) - Development workflow and architecture decisions
- [restaurant-qr-readme.txt](./restaurant-qr-readme.txt) - Original requirements

## 🤝 Contributing

See [PROGRESS.md](./PROGRESS.md) for current tasks and roadmap.

## 📄 License

MIT

---

**Built with** ⚡ Next.js • 🗄️ Supabase • 🐻 Zustand
