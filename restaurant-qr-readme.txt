# Restaurant QR Ordering System

A serverless QR code-based ordering system that allows customers to order directly from their table. Orders are automatically sent to kitchen and front-of-house printers.

## 🎯 System Overview

**Customer Flow:**
1. Customer scans QR code at their table
2. Menu loads in their browser (no app download needed)
3. They add items to cart and submit order
4. Order automatically prints in kitchen and at FOH
5. Staff prepares order and delivers to table
6. Cashier manually enters order into POS for payment

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router) + React + Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel
- **Printing:** node-thermal-printer / escpos
- **QR Generation:** qrcode library

## 📁 Project Structure

```
restaurant-ordering/
├── app/
│   ├── order/
│   │   └── page.tsx          # Main ordering page
│   ├── api/
│   │   ├── orders/
│   │   │   └── route.ts      # Create order endpoint
│   │   └── print/
│   │       └── route.ts      # Print webhook handler
│   └── admin/
│       └── page.tsx          # Admin dashboard (optional)
├── components/
│   ├── Menu.tsx              # Menu display component
│   ├── Cart.tsx              # Shopping cart
│   └── OrderConfirmation.tsx
├── lib/
│   ├── supabase.ts           # Supabase client
│   └── printer.ts            # Printer utilities
├── public/
│   └── qr-codes/             # Generated QR codes
├── scripts/
│   └── generate-qr.ts        # QR code generator script
└── supabase/
    └── migrations/           # Database migrations
```

## 🗄️ Database Schema

```sql
-- Tables
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_number INTEGER UNIQUE NOT NULL,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Menu Items
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  available BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id UUID REFERENCES tables(id),
  status TEXT DEFAULT 'pending',
  total DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account
- Vercel account (for deployment)
- Two thermal printers (kitchen + FOH)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd restaurant-ordering
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # Printer Configuration
   KITCHEN_PRINTER_IP=192.168.1.100
   FOH_PRINTER_IP=192.168.1.101
   PRINTER_PORT=9100
   ```

4. **Set up Supabase database**
   ```bash
   # Run migrations
   supabase db push
   ```

5. **Seed menu data**
   ```bash
   npm run seed
   ```

6. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## 📱 QR Code Generation

Generate QR codes for all your tables:

```bash
npm run generate-qr
```

This creates QR codes in `/public/qr-codes/` with URLs like:
- `yourapp.com/order?table=1`
- `yourapp.com/order?table=2`
- etc.

### Printing QR Codes

1. Open generated QR code images
2. Design table cards with:
   - Restaurant logo
   - QR code
   - "Scan to Order" text
   - Table number
3. Print on cardstock and laminate
4. Place in table stands

## 🖨️ Printer Setup

### Network Printer Configuration

1. **Connect printers to network**
   - Assign static IP addresses
   - Note IP addresses for `.env.local`

2. **Test printer connectivity**
   ```bash
   npm run test-printer
   ```

3. **Configure Supabase webhook**
   
   In Supabase Dashboard:
   - Go to Database → Webhooks
   - Create webhook on `orders` table
   - Set URL: `https://yourapp.com/api/print`
   - Trigger on: INSERT

### Docket Format

**Kitchen Docket:**
```
================================
        KITCHEN ORDER
================================
Table: 5
Time: 2:45 PM
Order #: 1234
--------------------------------

2x Margherita Pizza
   - Extra cheese
   
1x Caesar Salad
   - No croutons

1x Spaghetti Carbonara

--------------------------------
Notes: Customer allergic to nuts
================================
```

**FOH Docket:**
```
================================
Table 5 - Order Ready
================================
Time: 2:45 PM
Order #: 1234

Items: 4
Total: $45.50
================================
```

## 🔄 System Flow

```
Customer Scans QR
       ↓
Next.js Order Page Loads
       ↓
Customer Adds Items to Cart
       ↓
Submit Order → /api/orders
       ↓
Save to Supabase
       ↓
Supabase Webhook Triggers
       ↓
/api/print Receives Notification
       ↓
Format & Send to Printers
       ↓
Kitchen & FOH Print Dockets
```

## 📊 API Endpoints

### POST `/api/orders`
Create a new order

**Request:**
```json
{
  "table_id": "uuid",
  "items": [
    {
      "menu_item_id": "uuid",
      "quantity": 2,
      "notes": "Extra cheese"
    }
  ],
  "notes": "Customer allergic to nuts"
}
```

**Response:**
```json
{
  "success": true,
  "order_id": "uuid",
  "message": "Order sent to kitchen"
}
```

### POST `/api/print`
Triggered by Supabase webhook to print order

**Webhook Payload:**
```json
{
  "type": "INSERT",
  "table": "orders",
  "record": {
    "id": "uuid",
    "table_id": "uuid",
    "status": "pending",
    "total": 45.50
  }
}
```

## 🎨 Customization

### Menu Categories
Edit in `/lib/constants.ts`:
```typescript
export const MENU_CATEGORIES = [
  'Starters',
  'Mains',
  'Sides',
  'Drinks',
  'Desserts'
];
```

### Branding
- Update colors in `tailwind.config.ts`
- Add logo to `/public/logo.png`
- Customize menu styling in `/components/Menu.tsx`

## 🧪 Testing

```bash
# Run tests
npm run test

# Test printer connection
npm run test-printer

# Test complete order flow
npm run test-order-flow
```

### Manual Testing Checklist

- [ ] QR code scans and loads correct table
- [ ] Menu displays on mobile devices
- [ ] Can add/remove items from cart
- [ ] Order submits successfully
- [ ] Kitchen printer receives order
- [ ] FOH printer receives order
- [ ] Order appears in Supabase

## 🚀 Deployment

### Deploy to Vercel

1. **Connect GitHub repo**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to vercel.com
   - Import your GitHub repository
   - Add environment variables

3. **Configure custom domain**
   - Add domain in Vercel settings
   - Update DNS records

4. **Update Supabase webhook URL**
   - Change to production URL: `https://yourdomain.com/api/print`

### Post-Deployment

- [ ] Test live site with real QR codes
- [ ] Verify webhook triggers correctly
- [ ] Test printer connectivity from production
- [ ] Monitor error logs

## 🔧 Troubleshooting

### Orders not printing

1. Check printer IP addresses in `.env`
2. Verify printers are on same network
3. Check Supabase webhook logs
4. Test `/api/print` endpoint manually

### QR code not working

1. Verify URL format: `yourapp.com/order?table=X`
2. Check table exists in database
3. Test URL in browser first

### Menu not loading

1. Check Supabase connection
2. Verify menu items exist in database
3. Check browser console for errors

## 📈 Future Enhancements

- [ ] Payment integration (Stripe/Square)
- [ ] Real-time order status updates
- [ ] Customer order history
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Allergen filtering
- [ ] Loyalty program
- [ ] Kitchen display system (KDS)

## 🤝 Contributing

This is a private restaurant project, but suggestions are welcome!

## 📄 License

Private - All Rights Reserved

## 🆘 Support

For issues or questions:
- Check troubleshooting section above
- Review Supabase logs
- Check printer connectivity
- Contact: your-email@example.com

---

**Built with ❤️ for [Your Restaurant Name]**