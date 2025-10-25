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

## 🔧 Key Technologies

- **Next.js 14**: React framework with SSG/SSR
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Modern icon library
- **Responsive Design**: Works on all screen sizes

## 🌍 Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_HERO_VIDEO_URL=/videos/website-hero.mp4
NEXT_PUBLIC_SITE_NAME="Nature's Way Soil"
NEXT_PUBLIC_PHONE="(555) 123-4567"
NEXT_PUBLIC_EMAIL="hello@naturesway.com"
```

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

The website is now ready to deploy and fully functional with all the issues from the previous build resolved!
