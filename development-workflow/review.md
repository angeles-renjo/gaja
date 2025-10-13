# Review Stage Guidelines

This document provides critical guidelines for the review phase to ensure production-ready, secure, and maintainable code before deployment.

## 🎯 **Review Phase Objectives**

1. **Verify code quality** and adherence to standards
2. **Validate security** - RLS policies, input validation, no exposed secrets
3. **Ensure performance** - No obvious bottlenecks or memory leaks
4. **Check accessibility** - WCAG compliance where applicable
5. **Document learnings** - Capture knowledge for future reference

## 📋 **MANDATORY Review Checklist**

### **1. Code Quality Review (CRITICAL)**
- [ ] **TypeScript compilation** - `npm run build` passes
- [ ] **Linting passes** - `npm run lint` has no errors or warnings
- [ ] **No console.logs** - Except intentional error logging
- [ ] **No commented code** - Remove dead code
- [ ] **No TODOs** - Resolve or create issues for them
- [ ] **Proper naming** - Variables, functions, types follow conventions
- [ ] **DRY principle** - No unnecessary duplication
- [ ] **Code comments** - Complex logic is documented

### **2. Security Review (CRITICAL)**
- [ ] **RLS policies enabled** - All tables have Row Level Security
- [ ] **RLS policies tested** - Verify policies work as expected
- [ ] **No service role key in client** - Only anon key in frontend
- [ ] **Input validation** - All user inputs are validated
- [ ] **SQL injection prevention** - Use parameterized queries
- [ ] **XSS prevention** - User content is sanitized
- [ ] **No secrets in code** - Check .env is in .gitignore
- [ ] **CORS configured** - If using API routes
- [ ] **Rate limiting** - Consider for public endpoints

### **3. Performance Review**
- [ ] **Bundle size** - Check build output for large bundles
- [ ] **Database queries optimized** - Use indexes, avoid N+1
- [ ] **Images optimized** - Use Next.js Image component
- [ ] **Lazy loading** - Code split heavy components
- [ ] **Memoization** - Use React.memo/useMemo where needed
- [ ] **No memory leaks** - Cleanup subscriptions/timers
- [ ] **Loading states** - User feedback during async operations

### **4. Functionality Review**
- [ ] **Feature works** - All acceptance criteria met
- [ ] **Error handling** - All error paths tested
- [ ] **Edge cases** - Tested empty states, nulls, max values
- [ ] **Mobile responsive** - Works on small screens
- [ ] **Cross-browser** - Tested Chrome, Safari, Firefox
- [ ] **Network resilience** - Handles offline/slow connections
- [ ] **Data consistency** - No race conditions in state updates

### **5. User Experience Review**
- [ ] **Loading indicators** - Users know when something is loading
- [ ] **Error messages** - Clear, actionable error feedback
- [ ] **Success feedback** - Users know when actions succeed
- [ ] **Intuitive UI** - Interface is self-explanatory
- [ ] **Keyboard navigation** - Can use without mouse
- [ ] **Screen reader support** - ARIA labels where needed
- [ ] **Color contrast** - Text is readable

### **6. Database Review**
- [ ] **Migrations tested** - Run `npm run db:reset` successfully
- [ ] **Rollback tested** - DOWN migration works
- [ ] **Types generated** - TypeScript types match schema
- [ ] **Indexes added** - For frequently queried columns
- [ ] **Constraints set** - NOT NULL, UNIQUE, CHECK where needed
- [ ] **Cascade rules** - Foreign keys have proper ON DELETE
- [ ] **Data backed up** - Before running migrations in production

### **7. Documentation Review**
- [ ] **README updated** - If architecture changed
- [ ] **API documented** - If new routes added
- [ ] **Environment variables** - Document new vars needed
- [ ] **Migration notes** - Document schema changes
- [ ] **Inline comments** - Complex logic explained

## 🔍 **Detailed Review Areas**

### **Security Deep Dive (Supabase)**

#### **RLS Policy Review Checklist**
```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false;
-- Should return 0 rows (all tables should have RLS enabled)

-- Review all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Test policies with different user contexts
SET LOCAL ROLE anon;
SELECT * FROM menu_items; -- Should only see available items
RESET ROLE;
```

#### **Common RLS Pitfalls**
- **❌ Too permissive**: Policies that allow more access than needed
- **❌ Missing policies**: Tables without INSERT/UPDATE/DELETE policies
- **❌ Logic errors**: Policies that don't account for edge cases
- **❌ Performance**: Policies with expensive subqueries

### **Performance Deep Dive (Next.js + React)**

#### **Build Analysis**
```bash
# Check bundle sizes
npm run build

# Look for warnings about large bundles
# Route                                Size     First Load JS
# ┌ ○ /                                5 kB           XX kB
# ├ ○ /admin                           3 kB           XX kB
# └ ○ /order                           7 kB           XX kB

# If bundle is too large, investigate with:
ANALYZE=true npm run build
```

#### **Database Query Performance**
```sql
-- Find slow queries (enable logging first)
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY mean_time DESC
LIMIT 10;

-- Explain a specific query
EXPLAIN ANALYZE
SELECT o.*, t.table_number
FROM orders o
JOIN tables t ON o.table_id = t.id
WHERE o.created_at > NOW() - INTERVAL '1 day';

-- Check missing indexes
SELECT
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100
  AND correlation < 0.1;
```

#### **React Performance Issues**
```bash
# Find components without memo optimization
grep -r "export default function" src/components --include="*.tsx" | \
  xargs -I {} sh -c 'grep -L "React.memo" {}'

# Find expensive useEffect hooks (manual review needed)
grep -r "useEffect" src --include="*.tsx" -A 5

# Check for inline function definitions in JSX
grep -r "onClick={() =>" src/components --include="*.tsx"
```

### **Accessibility Review**

#### **Automated Checks**
```bash
# Install axe-core (if not already)
npm install -D @axe-core/react

# Run lighthouse audit
npx lighthouse http://localhost:3000 --view

# Check for common issues:
# - Missing alt text on images
# - Missing labels on form inputs
# - Insufficient color contrast
# - Missing ARIA labels on buttons
```

#### **Manual Accessibility Tests**
- [ ] **Keyboard only navigation** - Tab through entire app
- [ ] **Screen reader test** - Use VoiceOver (Mac) or NVDA (Windows)
- [ ] **Zoom to 200%** - UI should still be usable
- [ ] **Color blindness** - Test with color filters
- [ ] **Focus indicators** - Visible focus states on interactive elements

## ⚠️ **Critical Review Anti-Patterns to AVOID**

### **❌ SECURITY ANTI-PATTERNS**
- Don't skip security review because "it's just internal"
- Don't assume RLS policies work without testing them
- Don't commit secrets even in dead code
- Don't trust user input (including URL parameters)
- Don't skip CORS configuration for public APIs

### **❌ PERFORMANCE ANTI-PATTERNS**
- Don't ignore build warnings about large bundles
- Don't skip database query optimization
- Don't forget to clean up event listeners/timers
- Don't use `SELECT *` without measuring impact
- Don't skip image optimization

### **❌ CODE QUALITY ANTI-PATTERNS**
- Don't merge without passing linting
- Don't leave console.logs in production code
- Don't skip writing comments for complex logic
- Don't merge with TODOs (create issues instead)
- Don't ignore TypeScript errors with `@ts-ignore`

### **❌ TESTING ANTI-PATTERNS**
- Don't test only on desktop (test mobile too)
- Don't test only the happy path (test errors)
- Don't test only on fast internet (test slow 3G)
- Don't skip cross-browser testing
- Don't assume production will behave like dev

## ✅ **Review Success Criteria**

Before deploying to production, ensure:

1. **✅ Security reviewed** - RLS policies tested, no secrets exposed
2. **✅ Performance acceptable** - No obvious bottlenecks, bundle size reasonable
3. **✅ Code quality high** - Linting passes, no TODOs, proper types
4. **✅ Functionality complete** - All acceptance criteria met
5. **✅ UX polished** - Loading states, error handling, responsive
6. **✅ Accessibility baseline** - Keyboard navigation, screen reader support
7. **✅ Database ready** - Migrations tested, types generated
8. **✅ Documentation complete** - README, API docs, environment variables
9. **✅ Tests passing** - Manual testing complete, no known bugs
10. **✅ Deploy checklist ready** - All prerequisites documented

## 🚀 **Pre-Deployment Checklist**

### **Environment Setup**
- [ ] **Production database** - Created and accessible
- [ ] **Environment variables** - All vars set in production
- [ ] **Secrets configured** - API keys, database URLs secure
- [ ] **Domain configured** - DNS pointing to host
- [ ] **SSL certificate** - HTTPS enabled

### **Database Preparation**
- [ ] **Backup current data** - Before running migrations
- [ ] **Migrations staged** - All SQL files ready
- [ ] **RLS policies reviewed** - Tested in staging
- [ ] **Indexes created** - For performance
- [ ] **Test data removed** - Clean production data

### **Application Build**
- [ ] **Build succeeds** - `npm run build` passes
- [ ] **Environment vars correct** - Production API URLs
- [ ] **Static assets optimized** - Images, fonts compressed
- [ ] **Error tracking** - Sentry or similar configured
- [ ] **Analytics** - Google Analytics or similar (if needed)

### **Deployment**
- [ ] **Deploy to staging first** - Test in production-like environment
- [ ] **Smoke test** - Verify critical paths work
- [ ] **Monitor errors** - Watch logs for issues
- [ ] **Rollback plan** - Know how to revert if needed
- [ ] **Monitor performance** - Watch for slowdowns

### **Post-Deployment**
- [ ] **Test critical paths** - Ordering flow, admin dashboard
- [ ] **Check database** - Verify data integrity
- [ ] **Monitor logs** - Watch for errors
- [ ] **Test on real devices** - Mobile, tablet, desktop
- [ ] **Get user feedback** - Restaurant staff, customers

## 📊 **Performance Benchmarks (Gaja Restaurant System)**

### **Acceptable Performance Targets**
- **First Load JS**: < 200 KB (gzipped)
- **Page Load Time**: < 3 seconds on 4G
- **Time to Interactive**: < 5 seconds
- **Lighthouse Score**: > 90 (Performance)
- **Database Query**: < 100ms (95th percentile)
- **API Response**: < 200ms (95th percentile)

### **Performance Monitoring**
```bash
# Measure build size
npm run build | grep -E "^(Route|├|└)"

# Measure page load time
curl -o /dev/null -s -w '%{time_total}\n' https://your-domain.com

# Check Core Web Vitals
npx lighthouse https://your-domain.com --only-categories=performance
```

## 📝 **Review Documentation Template**

### **Code Review Checklist**
```markdown
## Security Review
- [ ] RLS policies enabled and tested
- [ ] No secrets in code
- [ ] Input validation implemented
- [ ] XSS/SQL injection prevention

## Performance Review
- [ ] Bundle size acceptable: [XX KB]
- [ ] Database queries optimized
- [ ] Images optimized
- [ ] No memory leaks

## Code Quality Review
- [ ] TypeScript compilation passes
- [ ] Linting passes
- [ ] No console.logs (except error logging)
- [ ] No TODOs
- [ ] Proper naming conventions

## Functionality Review
- [ ] Feature works as expected
- [ ] Error handling tested
- [ ] Edge cases covered
- [ ] Mobile responsive
- [ ] Cross-browser tested

## UX Review
- [ ] Loading indicators present
- [ ] Error messages clear
- [ ] Success feedback shown
- [ ] Keyboard navigation works
- [ ] Screen reader support

## Database Review
- [ ] Migrations tested
- [ ] Rollback tested
- [ ] Types generated
- [ ] Indexes added
- [ ] RLS policies secure

## Documentation Review
- [ ] README updated
- [ ] API documented
- [ ] Environment variables documented
- [ ] Migration notes added

## Known Issues
[List any issues discovered that need follow-up]

## Recommended Actions
[Any improvements suggested but not blocking]

## Approval
- [ ] Approved for deployment
- [ ] Approved with changes
- [ ] Needs more work
```

---

## 📚 **Lessons Learned Archive**

### **Project Architecture & Setup (COMPLETED ✅)**

#### **What Was Built**
- Next.js 14 app with TypeScript, Tailwind CSS
- Database schema with migrations (Supabase)
- State management (Zustand stores)
- Custom hooks pattern for data fetching
- Menu & Cart components

#### **Tech Stack**
- **Frontend**: Next.js 14, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **State**: Zustand (^5.0.8)
- **Database**: Supabase (PostgreSQL)
- **Data Fetching**: Custom hooks (useMenu, useSubmitOrder, useTableInfo)

#### **Challenges & Solutions**
- **Challenge**: Keep components clean without Supabase everywhere
- **Solution**: Custom hooks pattern - logic separated from UI

- **Challenge**: Cart needs persistence
- **Solution**: Zustand with persist middleware (localStorage)

- **Challenge**: Choose rendering strategy
- **Solution**: Client-side only for cost optimization

#### **Lessons Learned**
- ✅ Custom hooks > TanStack Query for simple use cases
- ✅ Zustand perfect for cart with persistence
- ✅ Client-side cheaper and simpler when no SEO needed
- ✅ Direct Supabase = lower latency

#### **Security Notes**
- RLS policies protect all tables
- Anon key used in frontend (not service role key)
- Input validation on all API endpoints
- No secrets committed to repository

#### **Performance Notes**
- Bundle size kept small with code splitting
- Database queries use indexes
- Images optimized with Next.js Image component
- No expensive re-renders with proper React patterns

---

### **Phase 1 Core Features (COMPLETED ✅)**

#### **What Was Built**
- Complete ordering system (QR → Menu → Cart → Order → Admin)
- OrderConfirmation component
- Customer ordering page
- Admin dashboard with real-time updates
- QR code generation script

#### **Challenges & Solutions**
- **Challenge**: Real-time order updates in admin
- **Solution**: Supabase real-time subscriptions

- **Challenge**: QR code generation for all tables
- **Solution**: Automated script with `qrcode` library

- **Challenge**: Print API integration (Phase 2)
- **Solution**: Stubbed endpoint with TODO for future work

#### **Lessons Learned**
- ✅ Real-time subscriptions easy with Supabase
- ✅ QR codes can be generated and saved as static assets
- ✅ Admin dashboard needs polling/subscriptions for live updates
- ✅ Print integration is separate concern (Phase 2)

#### **Security Notes**
- Orders table has RLS policy for admin access
- Table lookups validate table exists before showing menu
- Order submission validates items before insert

#### **Performance Notes**
- Admin dashboard polls every 5 seconds (could use subscriptions)
- QR codes generated once, served as static files
- Menu items cached in Zustand store

---

**Remember**: Review is not just about finding bugs - it's about knowledge transfer, improving code quality, and ensuring the team maintains high standards.

## 🔗 **Related Documentation**
- [Investigation Guidelines](./investigation.md)
- [Implementation Guidelines](./implementation.md)
- [Main README](../README.md)
- [Database Setup](../DATABASE_SETUP.md)
