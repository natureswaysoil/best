# Nature's Way Soil Website

A modern, responsive website for Nature's Way Soil featuring natural fertilizers, biochar, and compost products.

## 🌱 Features

### Fixed Issues from Previous Build
- **Proper Product Detail Layout**: Product images are properly sized (no more full-screen issues)
- **Working Product Videos**: Video controls are functional with play/pause and mute/unmute
- **Functional Chat Widget**: Working customer support chat with predefined responses
- **Working Exit-Intent Popup**: Properly functioning coupon popup with email capture

### Core Features
- Hero video with mute/unmute controls and accessibility features
- Responsive design that works on all devices
- Product catalog with filtering, search, and sorting
- Individual product pages with image galleries and videos
- Customer testimonials and reviews
- About page telling the family farm story
- Professional header/navigation and footer
- SEO optimized with proper meta tags

### 🎬 AI Video Generation (New!)
- **HeyGen Integration**: Professional AI avatars for product videos
- **Automated Content**: 30-second videos generated for all products
- **Blog Videos**: AI presenters for educational content
- **Fallback System**: Graceful fallback to FFmpeg if needed
- **Social Media Ready**: Videos optimized for all platforms

### Components Built
- `HeroVideo`: Your existing hero video component
- `Header`: Responsive navigation with transparent mode for hero
- `Footer`: Comprehensive footer with contact info and links  
- `Layout`: Main layout wrapper with header, footer, chat, and popup
- `ChatWidget`: Functional customer support chat
- `ExitIntentPopup`: Working exit-intent popup with coupon functionality
- `ProductDetail`: Properly structured product pages (fixes previous issues)

## 🚀 Getting Started

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm run start
```

## 📁 Project Structure

```
/workspaces/best/
├── components/           # Reusable React components
│   ├── HeroVideo.tsx    # Your hero video component
│   ├── Header.tsx       # Navigation header
│   ├── Footer.tsx       # Site footer
│   ├── Layout.tsx       # Main layout wrapper
│   ├── ChatWidget.tsx   # Customer support chat
│   ├── ExitIntentPopup.tsx  # Exit-intent coupon popup
│   └── ProductDetail.tsx    # Product page component
├── pages/               # Next.js pages
│   ├── index.tsx        # Homepage with hero video
│   ├── shop.tsx         # Product listing page
│   ├── about.tsx        # Company story page
│   ├── product/[id].tsx # Individual product pages
│   ├── _app.tsx         # Next.js app wrapper
│   └── _document.tsx    # HTML document structure
├── styles/              # CSS and styling
│   └── globals.css      # Global styles and Tailwind
├── public/              # Static assets
│   ├── images/          # Product and site images
│   └── videos/          # Video files including hero video
└── configuration files  # Next.js, TypeScript, Tailwind config
```

## 🎨 Styling

Built with:
- **Tailwind CSS**: Utility-first CSS framework
- **Custom Design System**: Nature-inspired color palette
- **Responsive Design**: Mobile-first approach
- **Modern UI**: Clean, professional design

## 📱 Pages Included

1. **Homepage** (`/`): Features your hero video plus product showcase
2. **Shop** (`/shop`): Product catalog with filtering and search
3. **Product Details** (`/product/[id]`): Individual product pages with working videos
4. **About** (`/about`): Company story and team information

## ✅ Issues Fixed

The previous build had these problems that are now fixed:

1. **❌ Product images taking full screen** → **✅ Properly sized product layouts**
2. **❌ Non-working product videos** → **✅ Functional video players with controls**  
3. **❌ Broken chat feature** → **✅ Working customer support chat**
4. **❌ Non-functional exit popup** → **✅ Working exit-intent popup with coupons**

## 🚀 Production Deployment

### Quick Start
```bash
# 1. Verify deployment readiness
./verify-deployment-ready.sh

# 2. Deploy to Google Cloud Run
./deploy-social-automation.sh

# 3. Test deployed service
./test-social-automation-service.sh
```

### What Gets Deployed
- **HeyGen AI Video Generation**: Professional avatar videos with natural voices
- **Twitter Automation**: Daily tweet posting with videos
- **YouTube Automation**: Daily video uploads with descriptions  
- **Cloud Run Service**: Scalable, serverless container deployment
- **Cloud Scheduler**: Automated twice-daily posting (6 AM & 6 PM UTC)
- **Secret Manager**: Secure credential storage

### Deployment Features
- **Automatic Scaling**: Cloud Run scales to zero when not in use
- **Secure Credentials**: All API keys stored in Google Secret Manager
- **Health Monitoring**: Built-in health checks and status endpoints
- **Error Recovery**: Automatic retries and fallback systems
- **Cost Efficient**: Pay only for actual usage

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete deployment instructions.

## 🎬 HeyGen Video Generation

Professional AI-generated videos with avatars and natural voices:

```bash
# Test HeyGen integration
npm run heygen:test

# List available avatars
npm run heygen:avatars

# List available voices  
npm run heygen:voices

# Generate videos with HeyGen (fallback to FFmpeg if needed)
npm run videos

# Generate blog videos with AI
npm run blog:videos
```

### HeyGen Features
- **AI Avatars**: Professional presenters for your content
- **Natural Voices**: High-quality text-to-speech in multiple languages
- **Automatic Fallback**: Uses FFmpeg if HeyGen is unavailable
- **Custom Scripts**: Product descriptions converted to engaging video scripts
- **Multiple Formats**: Optimized for different social media platforms

See [HEYGEN_INTEGRATION.md](HEYGEN_INTEGRATION.md) for detailed setup and customization.

## 🧪 Automation Testing & Validation

The project ships with a dry-run friendly verification suite covering data integrity, script templates, HeyGen readiness, and social media automation. No additional dependencies are required—everything runs through Node.js.

### Quick validation commands

```bash
# Validate environment configuration and filesystem prerequisites
npm run validate

# Run fast, offline-friendly checks for data and templates
npm run test:all
```

### Individual component checks

```bash
npm run test:csv        # Ensure product data and video assets are in sync
npm run test:openai     # Validate script templates and timing windows
npm run test:heygen     # Confirm HeyGen integration scaffolding and fallbacks
npm run test:platforms  # Inspect social automation server and credential coverage
```

### Full workflow verification

```bash
npm run test:e2e:dry    # Sequentially run all suites without requiring API credentials
npm run test:e2e        # Full verification (expects HeyGen + platform environment variables)
```

Each script prints detailed success, failure, and skip summaries so you can quickly address configuration gaps before deployment.

## 🔧 Key Technologies

- **Next.js 14**: React framework with SSG/SSR
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first styling
- **HeyGen AI**: Professional video generation
- **Lucide React**: Modern icon library
- **Responsive Design**: Works on all screen sizes

## 🌍 Environment Variables

Create a `.env.local` file:

```env
# Site Configuration
NEXT_PUBLIC_HERO_VIDEO_URL=/videos/website-hero.mp4
NEXT_PUBLIC_SITE_NAME="Nature's Way Soil"
NEXT_PUBLIC_PHONE="(555) 123-4567"
NEXT_PUBLIC_EMAIL="hello@naturesway.com"

# HeyGen AI Video Generation (Optional)
HEYGEN_API_KEY=your_heygen_api_key_here

# Other integrations
STRIPE_SECRET_KEY=your_stripe_key
SUPABASE_URL=your_supabase_url
RESEND_API_KEY=your_resend_key
RESEND_FROM="Nature's Way Soil <no-reply@natureswaysoil.com>"
```

`RESEND_FROM` must be a valid sender string in the form `Display Name <verified@yourdomain.com>` and the address must be verified in your Resend account.

## 📞 Support Features

- **Live Chat**: Functional chat widget with preset responses
- **Exit-Intent Popup**: Working coupon system to capture leads
- **Contact Information**: Easy access to phone and email
- **FAQ Integration**: Built into chat responses

## 🎯 Next Steps

To complete the website, add:
1. Your actual product images to `/public/images/`
2. Your hero video file to `/public/videos/website-hero.mp4`
3. ✅ Product videos completed (all 12 products have 30-second videos)
4. Team photos and farm images
5. Connect to a real database for product data
6. Set up email collection backend
7. Integrate with your payment system

## 📹 Product Videos

All 12 products now have automated 30-second videos:
- Video format: MP4 (H.264) + WebM for browser compatibility
- Resolution: 1280x720 (720p)
- Location: `/public/videos/{PRODUCT_ID}.mp4`
- Poster images included for better UX
- Regenerate videos: `npm run videos`
- Check video status: `npm run check:videos`

### 🤖 Automated Video Generation (GitHub Actions)

Videos can be automatically generated via GitHub Actions:
- **Workflow**: `.github/workflows/build-videos.yml`
- **Schedule**: Weekdays at 7 AM UTC
- **Dual Mode**: Works with or without Google Cloud credentials
  - **Full Mode**: Uses HeyGen AI for professional avatar videos (requires GCP setup)
  - **Fallback Mode**: Uses FFmpeg for text-based videos (no setup required)
- **Documentation**: See [.github/workflows/README.md](.github/workflows/README.md) for setup details

The website is now ready to deploy and fully functional with all the issues from the previous build resolved!
# Trigger deployment to pick up Stripe env vars - Mon Oct 27 14:03:31 UTC 2025
