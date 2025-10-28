# Repository Improvement Action Plan
## Nature's Way Soil Website

**Based on**: Complete Repository Audit (October 28, 2025)  
**Priority Levels**: 🔴 Critical | 🟡 High | 🟢 Medium | 🔵 Low

---

## Phase 1: Critical Fixes (Week 1)

### 🔴 1.1 Fix Build Error
**Status**: ✅ COMPLETED
- Fixed TypeScript compilation error in `data/blog.ts`
- Escaped apostrophe in author field
- Build now passes successfully

### 🔴 1.2 Implement Test Infrastructure
**Estimated Effort**: 8 hours  
**Dependencies**: None

**Tasks**:
```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event jest-environment-jsdom @types/jest

# Configuration files needed:
- jest.config.js
- jest.setup.js
- __tests__/ directory structure
```

**Initial Tests to Write**:
1. Component smoke tests (all components render)
2. Product data validation tests
3. Pricing calculation tests
4. Shipping calculation tests
5. API route handler tests

**Success Criteria**:
- At least 30% code coverage
- All critical paths tested
- CI integration ready

### 🔴 1.3 Remove Console Statements
**Estimated Effort**: 4 hours  
**Dependencies**: None

**Approach**:
```javascript
// 1. Create logging utility
// lib/logger.ts
export const logger = {
  info: (msg: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(msg, data);
    }
  },
  error: (msg: string, error?: any) => {
    console.error(msg, error); // Always log errors
    // Send to error tracking service
  }
};

// 2. Replace console.log with logger.info
// Find: console.log
// Replace with: logger.info

// 3. Configure Next.js to strip console in production
// next.config.js
compiler: {
  removeConsole: process.env.NODE_ENV === 'production' ? {
    exclude: ['error', 'warn']
  } : false
}
```

**Success Criteria**:
- Zero console.log in production builds
- Proper logging utility in place
- Error tracking configured

### 🔴 1.4 Secure Debug Endpoints
**Estimated Effort**: 2 hours  
**Dependencies**: None

**Files to Update**:
- `pages/api/debug-supabase.ts`
- `pages/api/test-supabase.ts`
- `pages/api/test-resend.ts`

**Options**:
1. **Remove entirely** (recommended for production)
2. **Add authentication**:
```typescript
if (process.env.NODE_ENV === 'production') {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.DEBUG_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
```
3. **Environment-based disabling**:
```typescript
if (process.env.NODE_ENV === 'production') {
  return res.status(404).json({ error: 'Not found' });
}
```

**Success Criteria**:
- Debug endpoints secured or removed
- No sensitive data exposed
- Production security verified

---

## Phase 2: High Priority Security & Performance (Week 2)

### 🟡 2.1 Add Rate Limiting
**Estimated Effort**: 6 hours  
**Dependencies**: None

**Implementation**:
```bash
npm install next-rate-limit
```

```typescript
// lib/rateLimiter.ts
import rateLimit from 'next-rate-limit';

export const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

// Usage in API routes
export default async function handler(req, res) {
  try {
    await limiter.check(res, 10, 'CACHE_TOKEN'); // 10 requests per minute
    // ... route logic
  } catch {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
}
```

**Routes to Protect**:
- `/api/create-checkout-session`
- `/api/create-payment-intent`
- `/api/validate-coupon`
- `/api/products`

**Success Criteria**:
- All public endpoints rate-limited
- Appropriate limits per endpoint
- Clear error messages

### 🟡 2.2 Add Input Validation
**Estimated Effort**: 8 hours  
**Dependencies**: None

**Implementation**:
```bash
npm install zod
```

**Example**:
```typescript
// lib/validation.ts
import { z } from 'zod';

export const checkoutSchema = z.object({
  productId: z.string().min(1),
  sizeId: z.string().min(1),
  quantity: z.number().int().positive().max(100),
  email: z.string().email(),
  // ... more fields
});

// In API route:
const result = checkoutSchema.safeParse(req.body);
if (!result.success) {
  return res.status(400).json({ 
    error: 'Invalid input',
    details: result.error.issues
  });
}
```

**Success Criteria**:
- All API routes validate input
- Consistent error responses
- SQL injection prevention

### 🟡 2.3 Update Deprecated Dependencies
**Estimated Effort**: 2 hours  
**Dependencies**: None

**Updates Needed**:
```bash
# Update ESLint
npm install --save-dev eslint@9 @eslint/js

# Update glob (if used directly)
npm install --save-dev glob@11

# Remove rimraf and inflight
npm uninstall rimraf inflight
# Replace with native Node.js alternatives
```

**Testing**:
- Verify build still works
- Check linting still passes
- Test all npm scripts

**Success Criteria**:
- No deprecated dependency warnings
- All tests pass
- Build successful

### 🟡 2.4 Optimize Images
**Estimated Effort**: 4 hours  
**Dependencies**: None

**Tools**:
```bash
npm install --save-dev sharp imagemin imagemin-mozjpeg imagemin-pngquant
```

**Script**:
```javascript
// scripts/optimize-images.mjs
import sharp from 'sharp';
import { glob } from 'glob';

const images = await glob('public/images/**/*.{jpg,jpeg,png}');

for (const img of images) {
  await sharp(img)
    .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(img.replace(/\.(jpg|jpeg|png)$/, '.webp'));
  
  console.log(`Optimized: ${img}`);
}
```

**Success Criteria**:
- All images <500KB
- WebP versions generated
- Lazy loading implemented

### 🟡 2.5 Implement Error Tracking
**Estimated Effort**: 3 hours  
**Dependencies**: Sentry account (free tier available)

**Implementation**:
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Configuration**:
```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});

// sentry.server.config.js
// Similar configuration for server-side
```

**Success Criteria**:
- Errors tracked in production
- Source maps uploaded
- Alert notifications configured

---

## Phase 3: CI/CD & Monitoring (Week 3)

### 🟢 3.1 Add PR Validation Workflow
**Estimated Effort**: 3 hours  
**Dependencies**: None

**File**: `.github/workflows/pr-validation.yml`

```yaml
name: PR Validation

on:
  pull_request:
    branches: [main, develop]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type Check
        run: npm run type-check
      
      - name: Test
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        if: always()
```

**Success Criteria**:
- All PRs validated automatically
- Clear failure feedback
- Coverage reports generated

### 🟢 3.2 Add Performance Monitoring
**Estimated Effort**: 4 hours  
**Dependencies**: None

**Options**:
1. **Vercel Analytics** (easiest, native)
2. **Google Analytics 4**
3. **Mixpanel** (advanced)

**Implementation (Vercel)**:
```bash
npm install @vercel/analytics
```

```typescript
// pages/_app.tsx
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

**Success Criteria**:
- Page load times tracked
- Core Web Vitals monitored
- User flow analytics

### 🟢 3.3 Add Lighthouse CI
**Estimated Effort**: 2 hours  
**Dependencies**: None

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - run: npm run start &
      - uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/shop
            http://localhost:3000/about
          uploadArtifacts: true
```

**Success Criteria**:
- Performance scores tracked
- Accessibility scores tracked
- SEO scores tracked

### 🟢 3.4 Implement Uptime Monitoring
**Estimated Effort**: 1 hour  
**Dependencies**: External service account

**Service Options**:
1. **UptimeRobot** (free tier: 50 monitors)
2. **Pingdom**
3. **Better Uptime**

**Monitors to Add**:
- Homepage: `https://natureswaysoil.com`
- Shop page: `https://natureswaysoil.com/shop`
- API health: `https://natureswaysoil.com/api/products`
- Checkout: `https://natureswaysoil.com/checkout`

**Success Criteria**:
- 5-minute check intervals
- Email/SMS alerts configured
- Status page available

---

## Phase 4: Code Quality & Documentation (Week 4)

### 🟢 4.1 Generate API Documentation
**Estimated Effort**: 6 hours  
**Dependencies**: None

**Approach**:
```bash
npm install swagger-jsdoc swagger-ui-react
```

**Create**: `pages/api-docs.tsx` with Swagger UI

**Document Endpoints**:
- GET `/api/products` - List all products
- POST `/api/create-checkout-session` - Create Stripe session
- POST `/api/validate-coupon` - Validate coupon code
- POST `/api/webhooks/stripe` - Stripe webhook handler

**Success Criteria**:
- All endpoints documented
- Request/response examples
- Interactive API explorer

### 🟢 4.2 Add Contributing Guidelines
**Estimated Effort**: 2 hours  
**Dependencies**: None

**File**: `CONTRIBUTING.md`

**Sections**:
- Development setup
- Code style guide
- Commit message conventions
- PR process
- Testing requirements
- Code review checklist

### 🟢 4.3 Create Deployment Runbook
**Estimated Effort**: 3 hours  
**Dependencies**: None

**File**: `DEPLOYMENT.md`

**Sections**:
- Pre-deployment checklist
- Environment variable setup
- Database migration process
- Rollback procedure
- Post-deployment verification
- Troubleshooting guide

### 🟢 4.4 Add Disaster Recovery Plan
**Estimated Effort**: 2 hours  
**Dependencies**: None

**File**: `DISASTER_RECOVERY.md`

**Sections**:
- Database backup procedures
- Data restoration process
- Service outage response
- Contact escalation tree
- Communication templates

---

## Phase 5: Advanced Features (Week 5+)

### 🔵 5.1 State Management with Zustand
**Estimated Effort**: 8 hours  
**Dependencies**: Design decision

```bash
npm install zustand
```

**Stores to Create**:
- `useCartStore` - Shopping cart state
- `useUserStore` - User session
- `useUIStore` - UI state (modals, notifications)

### 🔵 5.2 Generate XML Sitemap
**Estimated Effort**: 3 hours  
**Dependencies**: None

```bash
npm install next-sitemap
```

**Configuration**: `next-sitemap.config.js`

### 🔵 5.3 Add Structured Data
**Estimated Effort**: 4 hours  
**Dependencies**: None

**Types**:
- Product schema
- Organization schema
- BreadcrumbList schema
- Review schema (when reviews added)

### 🔵 5.4 Implement Accessibility Testing
**Estimated Effort**: 6 hours  
**Dependencies**: None

```bash
npm install --save-dev @axe-core/react jest-axe
```

**Tests**:
- Color contrast validation
- ARIA labels verification
- Keyboard navigation tests
- Screen reader compatibility

### 🔵 5.5 Add Product Inventory System
**Estimated Effort**: 16 hours  
**Dependencies**: Database schema updates

**Features**:
- Real-time stock levels
- Low stock alerts
- Out of stock handling
- Inventory history tracking

### 🔵 5.6 Customer Dashboard
**Estimated Effort**: 24 hours  
**Dependencies**: Authentication system

**Features**:
- Order history
- Saved addresses
- Reorder functionality
- Account settings

### 🔵 5.7 Enhanced Analytics
**Estimated Effort**: 8 hours  
**Dependencies**: Analytics service

**Tracking**:
- Product view events
- Add to cart events
- Checkout funnel
- Revenue attribution
- Campaign tracking

---

## Implementation Timeline

### Week 1: Critical Fixes
- Days 1-2: Testing infrastructure
- Days 3-4: Remove console statements + logging utility
- Day 5: Secure debug endpoints

### Week 2: Security & Performance
- Days 1-2: Rate limiting + input validation
- Day 3: Update dependencies
- Days 4-5: Image optimization + error tracking

### Week 3: CI/CD & Monitoring
- Days 1-2: PR validation workflow
- Day 3: Performance monitoring
- Day 4: Lighthouse CI
- Day 5: Uptime monitoring

### Week 4: Documentation
- Days 1-2: API documentation
- Day 3: Contributing guidelines
- Days 4-5: Runbooks and disaster recovery

### Week 5+: Advanced Features
- Prioritize based on business needs
- Implement incrementally
- Maintain test coverage

---

## Success Metrics

### Code Quality
- Test coverage: 60%+ (target: 80%)
- TypeScript strict mode: enabled
- ESLint errors: 0
- Bundle size: <100KB first load

### Performance
- Lighthouse Performance: >90
- Lighthouse Accessibility: >95
- Lighthouse SEO: >95
- First Contentful Paint: <1.5s
- Time to Interactive: <3.5s

### Security
- npm audit vulnerabilities: 0
- Rate limiting: enabled on all public APIs
- Input validation: 100% of API routes
- Error tracking: configured

### Reliability
- Uptime: >99.9%
- Error rate: <0.1%
- Mean time to recovery: <30 minutes
- Automated tests passing: 100%

---

## Resource Requirements

### Developer Time
- Week 1: 40 hours (1 FTE)
- Week 2: 40 hours (1 FTE)
- Week 3: 40 hours (1 FTE)
- Week 4: 40 hours (1 FTE)
- **Total**: 160 hours for Phase 1-4

### External Services (Monthly Cost)
- Sentry (Error Tracking): $0 (Free tier for <5K events/month)
- UptimeRobot (Monitoring): $0 (Free tier for 50 monitors)
- Vercel Analytics: $0 (Included with Vercel)
- **Total**: $0 with free tiers

### Optional Paid Services
- Sentry Pro: $26/month (10K events)
- Better Uptime: $10/month (unlimited monitors)
- CodeCov: $10/month (unlimited repos)
- **Optional Total**: $46/month

---

## Risk Assessment

### High Risk Items
- **No tests**: Could break production with changes
  - Mitigation: Implement tests ASAP (Phase 1)
  
- **Debug endpoints exposed**: Security risk
  - Mitigation: Secure in Week 1

### Medium Risk Items
- **No monitoring**: Limited visibility into issues
  - Mitigation: Implement in Week 3

- **Rate limiting missing**: Potential abuse
  - Mitigation: Implement in Week 2

### Low Risk Items
- **Image optimization**: Performance impact
  - Mitigation: Gradual rollout in Week 2

---

## Questions for Stakeholders

1. **Testing**: What level of test coverage is acceptable? (Recommend: 60%+)
2. **Monitoring**: Which analytics service should we use? (Vercel Analytics recommended)
3. **Error Tracking**: Is Sentry approved? (Free tier sufficient to start)
4. **Timeline**: Are 4-5 weeks acceptable for critical improvements?
5. **Resources**: Can we allocate 1 FTE for this work?
6. **Budget**: Are we approved for $0-46/month in optional services?

---

## Conclusion

This action plan addresses all critical issues found in the audit while providing a clear roadmap for ongoing improvements. The plan is structured to deliver maximum value in the first 2 weeks (critical fixes and security) while building toward a more robust, well-tested, and monitored system over 4-5 weeks.

**Immediate Next Steps**:
1. Review and approve this plan
2. Allocate developer resources
3. Approve any required service accounts
4. Begin Phase 1 implementation

**Last Updated**: October 28, 2025  
**Document Owner**: Development Team  
**Review Cycle**: Monthly
