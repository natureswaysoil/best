# Quick Wins - Immediate Code Improvements
## Nature's Way Soil Website

These are small, low-risk improvements that can be implemented quickly for immediate benefit.

---

## 1. Remove Console Statements in Production

### Current Problem
1,742 console.log/error statements throughout the codebase.

### Quick Fix: Next.js Configuration

**File**: `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // ADD THIS: Remove console.log in production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn', 'info']
    } : false
  },
  
  images: {
    domains: ['localhost', 'm.media-amazon.com', 'images.unsplash.com', 'd3uryq9bhgb5qr.cloudfront.net'],
    formats: ['image/webp', 'image/avif']
  },
  async headers() {
    return [
      {
        source: '/videos/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
```

**Benefit**: Instantly removes all console.log from production with zero code changes.

---

## 2. Add Security Headers

### Current Problem
Missing important security headers.

### Quick Fix: Security Headers Middleware

**File**: `middleware.ts` (create new file)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // CSP header (adjust as needed)
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.stripe.com https://*.supabase.co;"
  );

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

**Benefit**: Adds critical security headers in 30 minutes.

---

## 3. Disable Debug Endpoints in Production

### Current Problem
Debug endpoints expose configuration in production.

### Quick Fix: Environment Check

**Files to Update**:
- `pages/api/debug-supabase.ts`
- `pages/api/test-supabase.ts`
- `pages/api/test-resend.ts`

**Add to top of each handler**:

```typescript
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Disable in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }

  // ... existing code
}
```

**Benefit**: Secures debug endpoints in 15 minutes.

---

## 4. Add Basic Rate Limiting

### Quick Fix: Simple In-Memory Rate Limiter

**File**: `lib/rateLimiter.ts` (create new file)

```typescript
const cache = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000 // 1 minute
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = cache.get(identifier);

  // Clean expired entries periodically
  if (cache.size > 1000) {
    for (const [key, value] of cache.entries()) {
      if (value.resetTime < now) {
        cache.delete(key);
      }
    }
  }

  if (!record || record.resetTime < now) {
    const resetTime = now + windowMs;
    cache.set(identifier, { count: 1, resetTime });
    return { success: true, remaining: limit - 1, resetTime };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  return { success: true, remaining: limit - record.count, resetTime: record.resetTime };
}
```

**Usage in API Route**:

```typescript
import { rateLimit } from '../../lib/rateLimiter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Rate limit by IP
  const identifier = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown';
  const { success, remaining, resetTime } = rateLimit(identifier, 10, 60000);

  if (!success) {
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: new Date(resetTime).toISOString()
    });
  }

  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', '10');
  res.setHeader('X-RateLimit-Remaining', remaining.toString());
  res.setHeader('X-RateLimit-Reset', resetTime.toString());

  // ... rest of handler
}
```

**Benefit**: Basic protection in 30 minutes. Note: Use Redis for production scale.

---

## 5. Add Input Validation to Critical Endpoints

### Quick Fix: Zod Validation

**Install**:
```bash
npm install zod
```

**File**: `pages/api/create-checkout-session.ts`

```typescript
import { z } from 'zod';

// Define schema at top of file
const checkoutSchema = z.object({
  productId: z.string().min(1).max(50),
  sizeId: z.string().min(1).max(50),
  quantity: z.number().int().positive().max(100),
  email: z.string().email(),
  name: z.string().min(1).max(200),
  // ... other fields
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate input
  const validation = checkoutSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      error: 'Invalid input',
      details: validation.error.issues.map(i => ({
        field: i.path.join('.'),
        message: i.message
      }))
    });
  }

  const data = validation.data;
  
  // ... rest of handler using validated data
}
```

**Benefit**: Prevents invalid data, better error messages. 20 minutes per endpoint.

---

## 6. Add robots.txt

### Quick Fix: Static File

**File**: `public/robots.txt` (create new file)

```
# Allow all crawlers
User-agent: *
Allow: /

# Disallow admin and API routes
Disallow: /api/
Disallow: /admin

# Sitemap location
Sitemap: https://natureswaysoil.com/sitemap.xml
```

**Benefit**: Better SEO control. 2 minutes.

---

## 7. Generate sitemap.xml Dynamically

### Quick Fix: API Route

**File**: `pages/sitemap.xml.ts` (create new file)

```typescript
import { GetServerSideProps } from 'next';
import { products } from '../data/products';
import { blogArticles } from '../data/blog';

function generateSitemap() {
  const baseUrl = 'https://natureswaysoil.com';
  const currentDate = new Date().toISOString();

  const staticPages = [
    { url: '/', changefreq: 'daily', priority: '1.0' },
    { url: '/shop', changefreq: 'daily', priority: '0.9' },
    { url: '/about', changefreq: 'monthly', priority: '0.7' },
    { url: '/contact', changefreq: 'monthly', priority: '0.6' },
    { url: '/blog', changefreq: 'daily', priority: '0.8' },
  ];

  const productPages = products.map(product => ({
    url: `/product/${product.id}`,
    changefreq: 'weekly',
    priority: '0.8',
    lastmod: currentDate
  }));

  const blogPages = blogArticles.map(article => ({
    url: `/blog/${article.slug}`,
    changefreq: 'monthly',
    priority: '0.7',
    lastmod: article.publishedAt
  }));

  const allPages = [...staticPages, ...productPages, ...blogPages];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const sitemap = generateSitemap();

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
  res.write(sitemap);
  res.end();

  return { props: {} };
};

export default function Sitemap() {
  return null;
}
```

**Benefit**: SEO improvement, better indexing. 20 minutes.

---

## 8. Add Error Boundary

### Quick Fix: React Error Boundary

**File**: `components/ErrorBoundary.tsx` (create new file)

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // TODO: Send to error tracking service (Sentry)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Oops!</h1>
            <p className="text-lg text-gray-600 mb-8">Something went wrong.</p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Usage in** `pages/_app.tsx`:

```typescript
import { ErrorBoundary } from '../components/ErrorBoundary';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}
```

**Benefit**: Graceful error handling. 15 minutes.

---

## 9. Add Loading States

### Quick Fix: Loading Component

**File**: `components/Loading.tsx` (create new file)

```typescript
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}

export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );
}
```

**Benefit**: Better UX during loading. 10 minutes.

---

## 10. Add Environment Variable Validation

### Quick Fix: Startup Validation

**File**: `lib/env.ts` (create new file)

```typescript
const requiredEnvVars = {
  // Public
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  
  // Server-only (check only on server)
  ...(typeof window === 'undefined' ? {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  } : {})
};

export function validateEnv() {
  const missing: string[] = [];
  
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join('\n')}\n\n` +
      `Please check your .env.local file.`
    );
  }
}

// Run validation on startup
if (process.env.NODE_ENV !== 'test') {
  validateEnv();
}
```

**Import in** `pages/_app.tsx`:

```typescript
import '../lib/env'; // Validates on startup
```

**Benefit**: Catch configuration errors early. 15 minutes.

---

## 11. Add Meta Tags for Social Sharing

### Quick Fix: Update SEO Component

**File**: `components/SEO.tsx` (update existing)

Add to props:

```typescript
interface SEOProps {
  title: string;
  description: string;
  // ADD THESE:
  image?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}
```

Add to component:

```typescript
{/* Open Graph */}
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:type" content={type || 'website'} />
<meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
{image && <meta property="og:image" content={image} />}

{/* Twitter Card */}
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
{image && <meta name="twitter:image" content={image} />}

{/* Article specific */}
{type === 'article' && publishedTime && (
  <meta property="article:published_time" content={publishedTime} />
)}
{type === 'article' && modifiedTime && (
  <meta property="article:modified_time" content={modifiedTime} />
)}
```

**Benefit**: Better social media sharing. 20 minutes.

---

## 12. Add .nvmrc for Node Version

### Quick Fix: Node Version Lock

**File**: `.nvmrc` (create new file)

```
18.18.0
```

**Also update** `package.json`:

```json
{
  "engines": {
    "node": ">=18.18.0",
    "npm": ">=9.0.0"
  }
}
```

**Benefit**: Consistent Node.js version across team. 2 minutes.

---

## Implementation Checklist

Quick wins sorted by impact vs effort:

### High Impact, Low Effort (Do First)
- [x] ✅ Fix TypeScript build error (DONE)
- [ ] Add robots.txt (2 min)
- [ ] Add .nvmrc (2 min)
- [ ] Remove console in production (5 min)
- [ ] Disable debug endpoints (15 min)
- [ ] Add error boundary (15 min)
- [ ] Add environment validation (15 min)

### High Impact, Medium Effort (Do Next)
- [ ] Add security headers middleware (30 min)
- [ ] Add basic rate limiting (30 min)
- [ ] Generate sitemap.xml (20 min)
- [ ] Add social meta tags (20 min)

### Medium Impact, Medium Effort (Do Later)
- [ ] Add input validation (20 min per endpoint)
- [ ] Add loading states (10 min)

**Total Time for All Quick Wins**: ~4-5 hours
**Total Impact**: Significant improvement in security, SEO, and UX

---

## Testing Quick Wins

After implementing, verify:

1. **Build**: `npm run build` succeeds
2. **Type Check**: `npm run type-check` passes
3. **Lint**: `npm run lint` passes
4. **Dev Server**: `npm run dev` runs without errors
5. **Production**: Test on Vercel preview deployment

---

**Last Updated**: October 28, 2025  
**Implementation Status**: 1/12 completed (TypeScript fix)
