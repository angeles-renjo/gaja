# Implementation Stage Guidelines

This document provides critical guidelines for the implementation phase to ensure production-ready, maintainable code.

## 🎯 **Implementation Phase Objectives**

1. **Write clean, maintainable code** that follows project patterns
2. **Implement proper error handling** at all levels
3. **Ensure type safety** with TypeScript strict mode
4. **Follow security best practices** (RLS policies, input validation)
5. **Test incrementally** as you build

## 📋 **MANDATORY Implementation Checklist**

### **1. Before You Start (CRITICAL)**
- [ ] **Read the investigation summary** - Understand the problem and approach
- [ ] **Review existing similar code** - Follow established patterns
- [ ] **Create a branch** - Never work directly on main
- [ ] **Plan your commits** - Atomic commits with clear messages
- [ ] **Set up local test data** - Don't test on production

### **2. Database Changes**
- [ ] **Create migration file** - Use `npm run db:migration:new migration_name`
- [ ] **Write rollback logic** - Always include DOWN migration
- [ ] **Test migration locally** - Run `npm run db:reset` to verify
- [ ] **Update RLS policies** - Ensure security rules match new schema
- [ ] **Generate TypeScript types** - Run `supabase gen types typescript --local`
- [ ] **Document schema changes** - Update DATABASE_SETUP.md if needed

### **3. API/Route Handler Changes**
- [ ] **Follow Next.js patterns** - Use App Router conventions
- [ ] **Validate input** - Check all request data
- [ ] **Handle errors** - Return proper HTTP status codes
- [ ] **Log errors** - Use console.error for debugging
- [ ] **Test with curl/Postman** - Verify endpoints work

### **4. Zustand Store Changes**
- [ ] **Maintain immutability** - Use proper state update patterns
- [ ] **Add TypeScript types** - Full type safety for state
- [ ] **Handle persistence** - Migrate localStorage if schema changed
- [ ] **Document state shape** - Add comments for complex state
- [ ] **Test state transitions** - Verify all state changes work

### **5. React Component Changes**
- [ ] **Follow component structure** - Match existing patterns
- [ ] **Use TypeScript properly** - Type all props and state
- [ ] **Implement loading states** - Show feedback during async operations
- [ ] **Implement error states** - Display errors to users
- [ ] **Add key props to lists** - Prevent React warnings
- [ ] **Optimize re-renders** - Use React.memo if needed
- [ ] **Test accessibility** - Keyboard navigation, ARIA labels

### **6. Code Quality**
- [ ] **Run TypeScript check** - `npm run build` must pass
- [ ] **Run ESLint** - `npm run lint` must pass
- [ ] **Remove console.logs** - Clean up debug statements (except error logs)
- [ ] **Add comments** - Explain complex logic
- [ ] **Follow naming conventions** - camelCase, PascalCase, kebab-case
- [ ] **No hardcoded values** - Use constants or environment variables

## 🏗️ **Architecture Patterns (Gaja Restaurant System)**

### **Supabase Integration Patterns**

#### **Database Query Pattern (Custom Hooks)**
```typescript
// src/hooks/useMenuItems.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { MenuItem } from '@/types/database';

export function useMenuItems() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchItems() {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('available', true)
          .order('category', { ascending: true });

        if (fetchError) throw fetchError;
        setItems(data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.error('Failed to fetch menu items:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  return { items, loading, error };
}
```

#### **RLS Policy Pattern**
```sql
-- Enable RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Public read access for menu items
CREATE POLICY "Anyone can view available menu items"
  ON menu_items FOR SELECT
  USING (available = true);

-- Admin-only write access
CREATE POLICY "Only admins can modify menu items"
  ON menu_items FOR ALL
  USING (auth.role() = 'authenticated' AND auth.jwt()->>'role' = 'admin');
```

### **Next.js App Router Patterns**

#### **Server Component Pattern (Default)**
```typescript
// src/app/menu/page.tsx
import { supabase } from '@/lib/supabase';
import MenuList from '@/components/MenuList';

export default async function MenuPage() {
  // Fetch data on server (no loading state needed)
  const { data: items } = await supabase
    .from('menu_items')
    .select('*')
    .eq('available', true);

  return <MenuList items={items || []} />;
}
```

#### **Client Component Pattern (Interactive)**
```typescript
// src/components/Cart.tsx
'use client';

import { useCartStore } from '@/store/cart';
import { useState } from 'react';

export default function Cart() {
  const { items, removeItem, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Client-side interactivity
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Submit order logic
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Cart UI */}
    </div>
  );
}
```

#### **API Route Handler Pattern**
```typescript
// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate input
    const body = await request.json();
    const { table_id, items } = body;

    if (!table_id || !items?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert order
    const { data, error } = await supabase
      .from('orders')
      .insert({ table_id, items })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ order: data }, { status: 201 });
  } catch (error) {
    console.error('Order creation failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### **Zustand Store Patterns**

#### **Store with Persistence**
```typescript
// src/store/cart.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => set((state) => {
        const existing = state.items.find((i) => i.id === item.id);
        if (existing) {
          return {
            items: state.items.map((i) =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          };
        }
        return { items: [...state.items, { ...item, quantity: 1 }] };
      }),

      removeItem: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id),
      })),

      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map((i) =>
          i.id === id ? { ...i, quantity } : i
        ),
      })),

      clearCart: () => set({ items: [] }),

      total: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
```

### **Component Structure Pattern**

```
src/
├── app/                    # Next.js App Router
│   ├── (customer)/        # Customer-facing routes
│   │   ├── order/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── admin/             # Admin routes
│   │   └── page.tsx
│   ├── api/               # API routes
│   │   ├── orders/
│   │   │   └── route.ts
│   │   └── print/
│   │       └── route.ts
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── Menu.tsx
│   ├── Cart.tsx
│   └── OrderConfirmation.tsx
├── hooks/                 # Custom React hooks
│   ├── useMenu.ts
│   ├── useOrders.ts
│   └── useSubmitOrder.ts
├── store/                 # Zustand stores
│   ├── cart.ts
│   └── order.ts
├── lib/                   # Utilities
│   ├── supabase.ts
│   └── constants.ts
└── types/                 # TypeScript types
    └── database.ts
```

## ⚠️ **Critical Implementation Anti-Patterns to AVOID**

### **❌ DATABASE ANTI-PATTERNS**
- Don't bypass RLS policies with service role key in client code
- Don't forget to add indexes for frequently queried columns
- Don't use `SELECT *` in production code
- Don't forget cascade deletes for related records
- Don't commit migrations without testing rollback

### **❌ NEXT.JS ANTI-PATTERNS**
- Don't use 'use client' unnecessarily (prefer server components)
- Don't fetch data in client components if it can be done on server
- Don't forget to handle loading and error states
- Don't use process.env in client components (only NEXT_PUBLIC_ vars)
- Don't forget to set metadata for SEO (even if not primary concern)

### **❌ STATE MANAGEMENT ANTI-PATTERNS**
- Don't mutate Zustand state directly (use set functions)
- Don't store derived data in state (compute on-demand)
- Don't use Zustand for truly local component state (use useState)
- Don't forget to clear persisted state when schema changes
- Don't store sensitive data in localStorage

### **❌ REACT ANTI-PATTERNS**
- Don't call hooks conditionally or in loops
- Don't forget keys in lists (use unique IDs, not indexes)
- Don't use useEffect for data transformations (use useMemo)
- Don't forget to cleanup subscriptions in useEffect
- Don't pass inline functions to optimized children

### **❌ TYPESCRIPT ANTI-PATTERNS**
- Don't use `any` type (use `unknown` if truly unknown)
- Don't ignore TypeScript errors with `@ts-ignore`
- Don't forget to type async function return values
- Don't use type assertions unless absolutely necessary
- Don't skip generating database types from Supabase

### **❌ ERROR HANDLING ANTI-PATTERNS**
- Don't swallow errors silently (always log or display)
- Don't show technical errors to end users (use friendly messages)
- Don't forget to handle network failures
- Don't assume external APIs will always succeed
- Don't forget to validate user input

## 🧪 **Testing During Implementation**

### **Manual Testing Checklist**
- [ ] **Happy path** - Feature works as expected
- [ ] **Error cases** - Errors are handled gracefully
- [ ] **Edge cases** - Empty states, max values, special characters
- [ ] **Loading states** - Spinners/feedback shown appropriately
- [ ] **Responsive design** - Works on mobile and desktop
- [ ] **Browser testing** - Test in Chrome, Safari, Firefox
- [ ] **Network conditions** - Test slow 3G simulation

### **Testing Commands**
```bash
# Build and check for TypeScript errors
npm run build

# Run ESLint
npm run lint

# Test database migrations
npm run db:reset

# Generate latest TypeScript types
supabase gen types typescript --local > src/types/database.types.ts

# Start dev server
npm run dev

# Test API endpoints
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"table_id": 1, "items": [...]}'
```

## ✅ **Implementation Success Criteria**

Before moving to Review stage, ensure:

1. **✅ Code compiles** - `npm run build` succeeds
2. **✅ Linting passes** - `npm run lint` has no errors
3. **✅ Feature works** - Manually tested all scenarios
4. **✅ Errors are handled** - No unhandled promise rejections
5. **✅ Types are correct** - No `any` types, proper inference
6. **✅ UI is polished** - Loading states, error messages, responsive
7. **✅ Database is updated** - Migrations tested and types generated
8. **✅ Security is maintained** - RLS policies protect data
9. **✅ Performance is acceptable** - No obvious bottlenecks
10. **✅ Code is clean** - No debug logs, commented code, or TODOs

## 📤 **Hand-off to Review**

### **Implementation Summary Template:**
```markdown
## Feature Completed
[Name and brief description]

## Changes Made
### Database
- [Migration files created]
- [RLS policies added/modified]
- [Types generated: yes/no]

### API Routes
- [Routes created/modified]
- [Input validation added]
- [Error handling implemented]

### Components
- [Components created/modified]
- [Loading states added]
- [Error boundaries added]

### State Management
- [Stores created/modified]
- [Persistence strategy]

### Testing Performed
- [ ] Happy path tested
- [ ] Error cases tested
- [ ] Edge cases tested
- [ ] Mobile responsive
- [ ] Cross-browser tested

## Known Issues/TODOs
[Any issues discovered that need follow-up]

## Performance Notes
[Any performance considerations]

## Security Notes
[RLS policies, input validation, etc.]

## Deploy Checklist
- [ ] Environment variables documented
- [ ] Database migrations ready
- [ ] Build succeeds
- [ ] No secrets in code
```

---

## 📝 **Completed Implementations**

### Project Setup (COMPLETED ✅)

**Tasks**:
- [x] Next.js 14 with TypeScript, Tailwind
- [x] Zustand stores (cart, order)
- [x] Custom hooks (useMenu, useSubmitOrder, useTableInfo)
- [x] Supabase client setup
- [x] Database migrations
- [x] Menu & Cart components

**Status**: Foundation complete, ready for Phase 1 features

---

### Phase 1 Core Features (COMPLETED ✅)

**Goal**: Build complete ordering system (QR → Menu → Cart → Order → Admin)

**Tasks**:
- [x] OrderConfirmation component
- [x] Customer ordering page (`/app/order/page.tsx`)
- [x] Admin dashboard (`/app/admin/page.tsx`)
- [x] useOrders hook for admin
- [x] QR code generation script
- [x] Print API placeholder (Phase 2 ready)

**Progress**:
- 2025-10-12: Built all Phase 1 features
- OrderConfirmation shows success message with order ID
- Ordering page handles table lookup, menu display, cart, and confirmation
- Admin dashboard shows all orders with real-time updates
- QR script generates codes for all tables automatically
- Print endpoint stubbed with TODO comments for Phase 2

**Files Created**:
- src/components/OrderConfirmation.tsx
- src/app/order/page.tsx
- src/app/admin/page.tsx
- src/hooks/useOrders.ts
- src/app/api/print/route.ts
- scripts/generate-qr.ts

**Notes**:
- System is fully functional without printers
- Real-time order updates working in admin dashboard
- Ready to deploy and test with actual QR codes

---

**Remember**: Write code that your future self (and other developers) will understand. Clean, typed, tested code is faster in the long run.

## 🔗 **Related Documentation**
- [Investigation Guidelines](./investigation.md)
- [Review Guidelines](./review.md)
- [Main README](../README.md)
- [Database Setup](../DATABASE_SETUP.md)
