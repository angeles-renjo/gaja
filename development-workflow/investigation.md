# Investigation Stage Guidelines

This document provides critical guidelines for the investigation phase to prevent assumption-based development and ensure production-ready solutions.

## 🎯 **Investigation Phase Objectives**

1. **Understand the REAL problem** (not the perceived problem)
2. **Validate against ACTUAL production data** (not theoretical data)
3. **Identify all stakeholders and dependencies**
4. **Establish measurable success criteria**

## 📋 **MANDATORY Investigation Checklist**

### **1. Problem Understanding (CRITICAL)**
- [ ] **Reproduce the issue** in the exact environment it occurs (dev/staging/production)
- [ ] **Document symptoms vs root cause** - What users see vs what's actually broken
- [ ] **Gather error logs/stack traces** from production (not local environment)
- [ ] **Interview affected users** if applicable (restaurant staff, customers, admin)
- [ ] **Quantify impact** - How many users/orders/tables affected?

### **2. Data Reality Check (CRITICAL - THIS IS WHERE MOST PROJECTS FAIL)**
- [ ] **Extract actual production data samples** (anonymized if needed)
- [ ] **Analyze database schema vs code assumptions**
- [ ] **Check for null values, edge cases, malformed data**
- [ ] **Validate data types and constraints** in production
- [ ] **Document data patterns** - What does real data look like?

**🚨 LESSON LEARNED**: Never assume database schema based on TypeScript types. Always validate against production data first.

### **3. Technical Investigation**
- [ ] **Map data flow** from database → API → UI
- [ ] **Identify all transformation points** where data changes format
- [ ] **Check existing error handling** and logging
- [ ] **Review related code** that might be affected by changes
- [ ] **Identify performance bottlenecks** in current implementation

### **4. Architecture Analysis**
- [ ] **Understand current system design** and why it was built that way
- [ ] **Identify code smells** and technical debt
- [ ] **Map dependencies** and potential breaking changes
- [ ] **Review similar implementations** in the codebase for patterns
- [ ] **Check for existing utilities** that could be reused

## 🔍 **Investigation Deliverables**

### **Required Documentation:**
1. **Problem Statement** (1-2 sentences, crystal clear)
2. **Root Cause Analysis** (technical explanation with evidence)
3. **Production Data Samples** (anonymized JSON/CSV showing real patterns)
4. **Current vs Desired Behavior** (side-by-side comparison)
5. **Impact Assessment** (users affected, business impact, urgency)

### **Technical Analysis:**
1. **Data Flow Diagram** (how data moves through the system)
2. **Schema Documentation** (actual database structure with real examples)
3. **Error Analysis** (what's failing and why)
4. **Dependency Map** (what else might break if we change this)

### **Tech Stack Analysis (Gaja Restaurant System)**

#### **Supabase Investigation**
- [ ] **Database Schema** - Analyze actual table structure and relationships
- [ ] **RLS Policies** - Document security policies that might affect queries
- [ ] **Real-time Subscriptions** - Check if feature uses subscriptions
- [ ] **Query Performance** - Analyze slow queries with `EXPLAIN ANALYZE`
- [ ] **Row-Level Security** - Verify RLS doesn't block necessary operations

#### **Next.js App Router Investigation**
- [ ] **Route Structure** - Map affected routes (app/*, api/*)
- [ ] **Server vs Client Components** - Identify rendering boundaries
- [ ] **Data Fetching** - Check if server components fetch data correctly
- [ ] **Metadata Impact** - Will changes affect SEO/page metadata?
- [ ] **Route Handlers** - Review API routes that might be affected

#### **Zustand State Investigation**
- [ ] **Store Dependencies** - Which stores use affected data?
- [ ] **Persistence** - Does localStorage need clearing/migration?
- [ ] **State Synchronization** - Check for race conditions
- [ ] **Computed Values** - Identify derived state that needs updates

#### **React Component Investigation**
- [ ] **Component Tree** - Map component hierarchy for affected features
- [ ] **Props Flow** - Document data flow through components
- [ ] **Side Effects** - Review useEffect dependencies
- [ ] **Error Boundaries** - Check error handling coverage

## ⚠️ **Critical Investigation Anti-Patterns to AVOID**

### **❌ ASSUMPTIONS-BASED DEVELOPMENT**
- Don't assume database schema based on TypeScript types
- Don't assume data is always clean and complete
- Don't assume existing validation covers all cases
- Don't assume production behaves like development
- Don't assume RLS policies allow all operations

### **❌ SOLUTION JUMPING**
- Don't start coding before understanding the problem
- Don't copy solutions from Stack Overflow without understanding
- Don't over-engineer solutions for simple problems
- Don't ignore edge cases "because they're rare"
- Don't skip reading existing similar code

### **❌ INSUFFICIENT DATA VALIDATION**
- Don't trust that database constraints prevent bad data
- Don't assume API responses match documentation
- Don't ignore null/undefined scenarios
- Don't skip production data analysis
- Don't forget to check RLS policy impacts

### **❌ IGNORING CONTEXT**
- Don't investigate in isolation - check related features
- Don't skip reading git history/commit messages
- Don't ignore similar bugs that were fixed before
- Don't forget to check for mobile vs desktop differences

## 🛠️ **Investigation Tools & Commands**

### **Supabase Database Investigation:**
```sql
-- Check for null values in critical fields
SELECT
  COUNT(*) as total_rows,
  COUNT(*) - COUNT(column_name) as null_count,
  (COUNT(*) - COUNT(column_name))::float / COUNT(*) * 100 as null_percentage
FROM table_name;

-- Sample real data patterns for validation design
SELECT column_name, COUNT(*) as frequency
FROM table_name
GROUP BY column_name
ORDER BY frequency DESC
LIMIT 20;

-- Check RLS policies that might affect queries
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'your_table';

-- Analyze query performance
EXPLAIN ANALYZE
SELECT * FROM your_table WHERE condition;

-- Check foreign key relationships
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name='your_table';
```

### **Supabase CLI Commands:**
```bash
# Pull current database schema
supabase db pull

# Generate TypeScript types from database
supabase gen types typescript --local > lib/database.types.ts

# Check migration status
supabase migration list

# View database logs
supabase db logs

# Reset database to test migrations
npm run db:reset
```

### **Next.js Investigation:**
```bash
# Check bundle size impact
npm run build

# Analyze bundle composition
ANALYZE=true npm run build

# Find all server components
grep -r "use client" src/app --include="*.tsx" -L

# Find all client components
grep -r "use client" src/app --include="*.tsx" -l

# Check API routes
find src/app -name "route.ts" -o -name "route.tsx"

# Find async components (server components)
grep -r "export default async function" src/app --include="*.tsx"
```

### **Zustand Store Investigation:**
```bash
# Find all Zustand stores
grep -r "create(" src/store --include="*.ts" --include="*.tsx"

# Check localStorage usage
grep -r "persist" src/store --include="*.ts"

# Find store usage in components
grep -r "useCartStore\|useOrderStore" src --include="*.tsx"
```

### **React Component Investigation:**
```bash
# Find all components in feature
find src/components -name "*.tsx"

# Check for error boundaries
grep -r "ErrorBoundary\|componentDidCatch" src --include="*.tsx"

# Find all useEffect hooks
grep -r "useEffect" src --include="*.tsx" --include="*.ts"

# Check for loading states
grep -r "loading\|isLoading\|isPending" src --include="*.tsx"
```

### **Code Pattern Investigation:**
```bash
# Find existing hook patterns
find src/hooks -name "*.ts" -o -name "*.tsx"

# Check for similar utility functions
grep -r "function.*helper\|util" src/lib --include="*.ts"

# Find existing error handling patterns
grep -r "try.*catch\|throw new Error" src --include="*.ts" --include="*.tsx"

# Search for TODO comments related to feature
grep -r "TODO.*feature_name" src --include="*.ts" --include="*.tsx"
```

## ✅ **Investigation Success Criteria**

Before moving to Implementation stage, ensure:

1. **✅ Problem is clearly defined** with measurable symptoms
2. **✅ Production data has been analyzed** and real patterns documented
3. **✅ Root cause is identified** with technical evidence
4. **✅ Solution approach is validated** against real constraints
5. **✅ Success metrics are defined** - How will we know it's fixed?
6. **✅ Dependencies are mapped** - What else might be affected?
7. **✅ RLS policies are understood** - Will Supabase security allow this?
8. **✅ Component boundaries are clear** - Server vs Client components defined

## 📤 **Hand-off to Implementation**

### **Investigation Summary Template:**
```markdown
## Problem Statement
[Clear, 1-2 sentence description]

## Root Cause
[Technical explanation with evidence]

## Production Data Analysis
[Real data samples and patterns found]

## Current Behavior
[What happens now - include screenshots/logs]

## Desired Behavior
[What should happen - include mockups if UI change]

## Proposed Solution
[High-level approach validated against real constraints]

## Architecture Impact
- **Database Changes**: [migrations needed]
- **API Changes**: [route handlers affected]
- **Component Changes**: [which components need updates]
- **State Changes**: [Zustand store modifications]
- **RLS Policy Changes**: [security policy updates]

## Success Criteria
[Measurable outcomes that define success]

## Testing Strategy
- **Unit Tests**: [what to test]
- **Integration Tests**: [what to test]
- **Manual Testing**: [steps to verify]

## Implementation Notes
[Key technical considerations and gotchas]

## Estimated Complexity
[Simple/Medium/Complex + time estimate]
```

---

## 📝 **Completed Investigations**

### Architecture Decisions (COMPLETED ✅)

#### Rendering Strategy: Client-Side Only
**Why**: Cost optimization, no SEO needed, simpler deployment
**Alternatives**: SSR (expensive), SSG (unnecessary)

#### State Management: Zustand
**Why**: 1KB bundle, localStorage persistence, better than Context API
**Alternatives**: Redux (50KB), Context (slow re-renders)

#### Data Fetching: Custom Hooks
**Why**: No caching needed, simpler than TanStack Query
**Alternatives**: TanStack Query (overkill), SWR (too much)

#### API Layer: Direct Supabase
**Why**: Lower latency, no serverless costs, RLS for security
**Alternatives**: API Routes (extra hop, more cost)

#### Database: Supabase PostgreSQL
**Why**: Free tier, migrations, PostgreSQL
**Alternatives**: Firebase (expensive), PlanetScale (limited)

---

**Remember**: The investigation phase is where most projects succeed or fail. Spending extra time here saves weeks of rework later. Always validate assumptions against production reality.

## 🔗 **Related Documentation**
- [Implementation Guidelines](./implementation.md)
- [Review Guidelines](./review.md)
- [Main README](../README.md)
- [Database Setup](../DATABASE_SETUP.md)
