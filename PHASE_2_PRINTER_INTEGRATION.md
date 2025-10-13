# Phase 2: Raspberry Pi Printer Integration - Complete Plan

**Status:** Planning Complete ✅ | Implementation: Not Started
**Last Updated:** 2025-10-12
**Estimated Time:** 4-6 hours coding + 1-2 hours Pi setup

---

## 🎯 Overview

Implement automatic receipt printing using Raspberry Pi when customers place QR orders. The system will share the existing network printer with the iPad POS system without any interference.

---

## 🔄 Complete System Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Customer scans QR code on table                         │
│ 2. Customer orders via phone browser                        │
│ 3. Vercel app processes order                              │
│ 4. Order saved to Supabase database (cloud)                │
│ 5. Raspberry Pi (at restaurant) listens via real-time      │
│ 6. New order detected instantly → Pi fetches details       │
│ 7. Pi formats receipt (80mm thermal format)                │
│ 8. Pi sends to network printer via TCP (192.168.x.x:9100) │
│ 9. Receipt prints at kitchen                               │
│ 10. Pi marks order as "printed" in database                │
└─────────────────────────────────────────────────────────────┘

iPad POS continues working normally - ZERO interference!
```

---

## 📦 What Will Be Built

### Part 1: Main App Updates (Existing Project)

**Location:** `/Users/renjoangeles/Documents/GitHub/gaja/`

#### Database Changes:
```sql
-- Add to orders table:
- printed (BOOLEAN DEFAULT false)
- printed_at (TIMESTAMPTZ NULL)
- print_attempts (INTEGER DEFAULT 0)
```

#### Files to Modify:
1. `supabase/migrations/[timestamp]_add_print_status.sql` (NEW)
   - SQL migration to add columns

2. `src/types/index.ts`
   - Add print fields to Order type

3. `src/app/admin/page.tsx`
   - Show print status indicator
   - Add manual print button for failed orders

---

### Part 2: Raspberry Pi Print Server (NEW Project)

**Location:** `/Users/renjoangeles/Documents/GitHub/restaurant-print-server/`
**Type:** Standalone Node.js application (separate repo)

#### Project Structure:
```
restaurant-print-server/
├── package.json                 # Dependencies: @supabase/supabase-js, node-thermal-printer
├── tsconfig.json               # TypeScript configuration
├── .env.example                # Configuration template
├── .gitignore                  # Git ignore rules
├── README.md                   # Main setup guide
├── docs/
│   ├── RASPBERRY_PI_SETUP.md   # Pi-specific setup steps
│   ├── TROUBLESHOOTING.md      # Common issues and fixes
│   └── DAILY_OPERATIONS.md     # Staff guide
├── src/
│   ├── index.ts               # Main entry point
│   ├── config.ts              # Configuration loader
│   ├── lib/
│   │   ├── supabase.ts       # Supabase client setup
│   │   ├── printer.ts        # Printer connection & commands
│   │   ├── format.ts         # Receipt formatting (80mm)
│   │   └── logger.ts         # Logging utility
│   └── types/
│       └── index.ts           # TypeScript type definitions
└── systemd/
    ├── print-server.service   # Systemd service file (auto-start)
    └── install.sh             # Service installation script
```

#### Key Features:
- ✅ Real-time Supabase subscriptions (instant, FREE)
- ✅ Connects to Epson TM-m30II-NT via TCP/IP
- ✅ Auto-retry on failures (3 attempts)
- ✅ Marks orders as printed in database
- ✅ Detailed logging for troubleshooting
- ✅ Graceful shutdown handling
- ✅ Auto-reconnection if network drops
- ✅ Connection status monitoring

---

## 🛒 Hardware Requirements

### What to Buy (New Zealand):

**Raspberry Pi 5 4GB Starter Kit** (~$180-220 NZD)
- Raspberry Pi 5 (4GB RAM)
- Official power supply (NZ plug)
- 32GB MicroSD card (pre-loaded with NOOBS)
- Case (black)
- HDMI cable

**Where to Buy:**
- Nicegear.co.nz
- PBTech.co.nz
- Jaycar.co.nz
- MindKits.co.nz

**Already Have:**
- ✅ Network printer (Epson TM-m30II-NT M267E)
- ✅ Restaurant WiFi network
- ✅ iPad POS system (continues unchanged)

---

## 📋 Implementation Steps

### Phase A: Database & Admin Dashboard (Main Project)

**Step 1: Create Database Migration**
```bash
cd /Users/renjoangeles/Documents/GitHub/gaja
npx supabase migration new add_print_status
```

**Step 2: Write Migration SQL**
- Add printed, printed_at, print_attempts columns
- Create index on printed column
- Set default values

**Step 3: Update TypeScript Types**
- Add print fields to Order interface

**Step 4: Update Admin Dashboard**
- Show print status (✅ Printed / ⏳ Pending / ❌ Failed)
- Display print timestamp
- Add manual "Print" button (future feature)

**Step 5: Test Locally**
- Run migration: `npm run db:push`
- Verify columns exist
- Check admin dashboard displays correctly

---

### Phase B: Create Print Server Project

**Step 1: Create New Project Folder**
```bash
cd /Users/renjoangeles/Documents/GitHub
mkdir restaurant-print-server
cd restaurant-print-server
```

**Step 2: Initialize Node.js Project**
```bash
npm init -y
npm install @supabase/supabase-js node-thermal-printer dotenv
npm install -D typescript @types/node tsx
```

**Step 3: Create TypeScript Config**
- tsconfig.json with proper settings

**Step 4: Create Source Files**
- config.ts - Load environment variables
- lib/supabase.ts - Supabase client
- lib/printer.ts - Printer connection utilities
- lib/format.ts - Receipt formatting
- lib/logger.ts - Logging utility
- index.ts - Main application

**Step 5: Implement Real-time Listener**
```typescript
// Subscribe to new orders
supabase
  .channel('orders')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'orders' },
    async (payload) => {
      await handleNewOrder(payload.new);
    }
  )
  .subscribe();
```

**Step 6: Implement Printer Logic**
```typescript
// Connect to printer via TCP
const printer = new ThermalPrinter({
  type: PrinterTypes.EPSON,
  interface: `tcp://${PRINTER_IP}:9100`,
  width: 48, // 80mm paper
});

// Format and print
printer.alignCenter();
printer.println('QR ORDER - TABLE 5');
// ... more formatting
await printer.execute();
```

---

### Phase C: Documentation

**Step 1: Main README**
- Overview
- Quick start guide
- Configuration

**Step 2: Raspberry Pi Setup Guide**
- Hardware assembly
- OS installation (NOOBS)
- Network configuration
- Node.js installation
- Print server deployment

**Step 3: Troubleshooting Guide**
- Printer not printing
- Connection issues
- Service not starting
- Log file locations

**Step 4: Daily Operations Guide**
- For restaurant staff
- What to do if printer stops
- How to restart
- When to call for help

---

### Phase D: When Raspberry Pi Arrives

**Step 1: Physical Setup (15 min)**
- [ ] Unbox Raspberry Pi
- [ ] Insert SD card (pre-loaded with NOOBS)
- [ ] Connect to power
- [ ] Connect to monitor/keyboard (one-time only)
- [ ] Connect to Ethernet or WiFi

**Step 2: OS Setup (15 min)**
- [ ] Boot Pi (NOOBS menu appears)
- [ ] Select "Raspberry Pi OS (64-bit)"
- [ ] Wait for installation
- [ ] Complete setup wizard (language, WiFi, password)
- [ ] Update system: `sudo apt update && sudo apt upgrade -y`

**Step 3: Install Node.js (5 min)**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Verify installation
```

**Step 4: Deploy Print Server (20 min)**
```bash
# Transfer code to Pi (via GitHub or USB)
git clone https://github.com/your-username/restaurant-print-server.git
cd restaurant-print-server

# Install dependencies
npm install

# Create .env file
cp .env.example .env
nano .env  # Edit configuration
```

**Step 5: Configuration**
- [ ] Get printer IP from POS settings or printer test page
- [ ] Add printer IP to .env
- [ ] Add Supabase credentials to .env
- [ ] Set log level to 'info'

**Step 6: Test Run**
```bash
npm start

# In another terminal, place test order from phone
# Check if receipt prints
# Verify logs show success
```

**Step 7: Setup Auto-Start**
```bash
# Install systemd service
sudo bash systemd/install.sh

# Enable auto-start
sudo systemctl enable print-server
sudo systemctl start print-server

# Check status
sudo systemctl status print-server

# Reboot and verify auto-starts
sudo reboot
```

**Step 8: Production Deployment**
- [ ] Hide Pi behind counter
- [ ] Label power cable
- [ ] Document Pi IP address
- [ ] Test full workflow
- [ ] Done! 🎉

---

## 🔧 Configuration

### Environment Variables

**Main App (.env.local + Vercel):**
```bash
# Already configured
NEXT_PUBLIC_SUPABASE_URL=https://knqishnucgrnasqcvldn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_BASE_URL=http://192.168.4.39:3000  # Local dev
NEXT_PUBLIC_RESTAURANT_NAME=gaja
```

**Print Server (.env on Raspberry Pi):**
```bash
# Supabase Configuration
SUPABASE_URL=https://knqishnucgrnasqcvldn.supabase.co
SUPABASE_SERVICE_KEY=<get from Supabase dashboard>

# Printer Configuration
PRINTER_IP=192.168.1.50  # Find from POS settings or printer test page
PRINTER_PORT=9100
PRINTER_TYPE=epson
PRINTER_WIDTH=48  # Characters per line (80mm = 48 chars)

# Application Configuration
LOG_LEVEL=info  # debug, info, warn, error
RETRY_ATTEMPTS=3
RETRY_DELAY=5000  # milliseconds
```

---

## 🔒 Security Considerations

### Supabase Service Key

**Why needed:**
- Print server needs to UPDATE orders.printed field
- Anon key doesn't have write permissions

**How to create:**
1. Go to Supabase Dashboard
2. Settings > API
3. Create new service role key with limited permissions:
   - SELECT on: orders, order_items, tables, menu_items
   - UPDATE on: orders (only printed, printed_at, print_attempts columns)
4. Store securely in Pi's .env file
5. Never commit to git!

### Network Security

- ✅ Pi only needs outbound access (to Supabase)
- ✅ No inbound ports required
- ✅ Printer communication stays on local network
- ✅ Enable SSH key authentication (disable password)
- ✅ Keep Pi OS updated

---

## 💰 Cost Breakdown

### One-Time Costs:
- Raspberry Pi 5 Starter Kit: **~$200 NZD**
- Network printer: **Already owned** ✅

### Recurring Costs:
- Electricity: **~$2-3 NZD/year**
- Internet: **Already have** ✅
- Supabase Free Tier: **$0/month** ✅
- Vercel Free Tier: **$0/month** ✅
- **Total: ~$0/month** 🎉

### Comparison to PrintNode:
| Solution | Year 1 | Year 5 | Savings |
|----------|--------|--------|---------|
| PrintNode | $200 NZD | $1,000 NZD | - |
| Raspberry Pi | $200 NZD | $210 NZD | **$790 NZD** |

---

## 🚨 Risk Mitigation

### What if Printer Fails?
- Orders still save to Supabase
- Staff checks admin dashboard
- Can manually process orders
- Order history intact

### What if Raspberry Pi Fails?
- Orders still save to Supabase
- Restaurant operates normally via iPad POS
- Staff checks admin dashboard for QR orders
- Replace/restart Pi when convenient
- No data loss

### What if Internet Fails?
- iPad POS may continue (if local network works)
- QR orders won't work (require internet)
- Existing operations unaffected
- Resume when internet restored

### Rollback Plan:
1. Power off Raspberry Pi
2. Remove QR codes from tables
3. Continue with iPad POS only
4. Fix issues at convenient time
5. Re-enable when ready

---

## ✅ Success Criteria

**Phase 2 is complete when:**
- [x] Database migration deployed
- [x] Admin dashboard shows print status
- [x] Print server code complete and tested
- [x] Documentation complete
- [ ] Raspberry Pi purchased
- [ ] Pi set up and running
- [ ] Customer places QR order → Receipt prints automatically
- [ ] iPad POS prints receipts normally (unchanged)
- [ ] Pi runs 24/7 without manual intervention
- [ ] Clear receipt headers distinguish QR vs POS orders

---

## 📚 Next Steps

1. **Read this document thoroughly** ✅
2. **Order Raspberry Pi** (if not already ordered)
3. **Approve code implementation** (creates all files)
4. **Test locally** (admin dashboard changes)
5. **Wait for Pi to arrive**
6. **Follow Pi setup guide**
7. **Go live!** 🚀

---

## 📞 Support & Questions

**During Development:**
- Ask me any questions about the plan
- Request clarifications
- Suggest improvements

**After Pi Arrives:**
- Follow setup documentation
- Check troubleshooting guide
- I can help with issues

---

**Ready to start coding? Say "yes" and I'll begin creating all the files!**
