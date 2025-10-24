#!/bin/bash

# Deploy Nature's Way Soil Public Assets to Main Website
# This script deploys video assets and other public files to the main website

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOYMENT_DIR="$SCRIPT_DIR/deployment-package"
MAIN_WEBSITE_REPO="natureswaysoil/natureswaysoil.github.io"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Nature's Way Soil Asset Deployment Script${NC}"
echo "=================================================="

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI (gh) is required but not installed"
    exit 1
fi

if ! command -v git &> /dev/null; then
    print_error "Git is required but not installed"
    exit 1
fi

print_status "Prerequisites check passed"

# Verify deployment package exists
if [ ! -d "$DEPLOYMENT_DIR" ]; then
    print_error "Deployment package not found at $DEPLOYMENT_DIR"
    exit 1
fi

echo -e "${BLUE}Deployment package contents:${NC}"
find "$DEPLOYMENT_DIR" -type f | head -20
echo ""

# Show file count and sizes
VIDEO_COUNT=$(find "$DEPLOYMENT_DIR/videos" -type f -name "*.mp4" | wc -l)
WEBM_COUNT=$(find "$DEPLOYMENT_DIR/videos" -type f -name "*.webm" | wc -l)
JPG_COUNT=$(find "$DEPLOYMENT_DIR/videos" -type f -name "*.jpg" | wc -l)
TOTAL_SIZE=$(du -sh "$DEPLOYMENT_DIR" | cut -f1)

echo -e "${BLUE}Asset Summary:${NC}"
echo "  📹 MP4 Videos: $VIDEO_COUNT files"
echo "  🎬 WebM Videos: $WEBM_COUNT files"
echo "  🖼️  Thumbnails: $JPG_COUNT files"
echo "  📦 Total Size: $TOTAL_SIZE"
echo ""

# Deployment options
echo -e "${BLUE}Deployment Options:${NC}"
echo "1. Clone and deploy to main website repository ($MAIN_WEBSITE_REPO)"
echo "2. Create tar.gz package for manual upload"
echo "3. Show deployment instructions only"
echo ""

read -p "Choose deployment method (1-3): " DEPLOY_METHOD

case $DEPLOY_METHOD in
    1)
        echo -e "${BLUE}Deploying to main website repository...${NC}"
        
        # Create temporary directory for main website
        TEMP_DIR=$(mktemp -d)
        echo "Working in temporary directory: $TEMP_DIR"
        
        # Clone main website repository
        echo "Cloning $MAIN_WEBSITE_REPO..."
        cd "$TEMP_DIR"
        gh repo clone "$MAIN_WEBSITE_REPO" main-website
        
        if [ $? -ne 0 ]; then
            print_error "Failed to clone main website repository"
            print_warning "This might be because the repository doesn't exist or you don't have access"
            exit 1
        fi
        
        cd main-website
        
        # Copy assets to main website
        echo "Copying video assets..."
        mkdir -p videos images products dashboard
        
        cp -r "$DEPLOYMENT_DIR/videos/"* videos/
        cp -r "$DEPLOYMENT_DIR/dashboard/"* dashboard/ 2>/dev/null || true
        
        # Add and commit changes
        git add .
        
        if git diff --staged --quiet; then
            print_warning "No changes to commit - assets may already be deployed"
        else
            git commit -m "Deploy public assets from best repository
            
            - Added $(find videos -name '*.mp4' | wc -l) MP4 product videos
            - Added $(find videos -name '*.webm' | wc -l) WebM product videos  
            - Added $(find videos -name '*.jpg' | wc -l) product thumbnail images
            - Updated dashboard assets
            
            Total deployment size: $TOTAL_SIZE"
            
            echo -e "${YELLOW}Ready to push changes. Push now? (y/n)${NC}"
            read -p "" PUSH_CONFIRM
            
            if [ "$PUSH_CONFIRM" = "y" ] || [ "$PUSH_CONFIRM" = "Y" ]; then
                git push origin main
                print_status "Assets deployed successfully to main website!"
                echo ""
                echo -e "${GREEN}🌐 Your assets should now be available at:${NC}"
                echo "  Videos: https://www.natureswaysoil.com/videos/"
                echo "  Dashboard: https://www.natureswaysoil.com/dashboard/"
            else
                print_warning "Changes committed locally but not pushed"
                echo "To push later, run: cd $TEMP_DIR/main-website && git push origin main"
            fi
        fi
        
        # Cleanup
        echo "Cleaning up temporary directory..."
        cd "$SCRIPT_DIR"
        rm -rf "$TEMP_DIR"
        ;;
        
    2)
        echo -e "${BLUE}Creating deployment package...${NC}"
        PACKAGE_NAME="natureswaysoil-assets-$(date +%Y%m%d-%H%M%S).tar.gz"
        
        cd "$SCRIPT_DIR"
        tar -czf "$PACKAGE_NAME" -C deployment-package .
        
        print_status "Package created: $PACKAGE_NAME"
        echo ""
        echo -e "${BLUE}Manual deployment instructions:${NC}"
        echo "1. Upload $PACKAGE_NAME to your web server"
        echo "2. Extract in the website root directory:"
        echo "   tar -xzf $PACKAGE_NAME"
        echo "3. Verify assets are accessible at:"
        echo "   https://www.natureswaysoil.com/videos/"
        echo "   https://www.natureswaysoil.com/dashboard/"
        ;;
        
    3)
        echo -e "${BLUE}Deployment Instructions:${NC}"
        echo ""
        echo "To deploy manually:"
        echo "1. Copy the contents of $DEPLOYMENT_DIR to your website root"
        echo "2. Ensure the following directory structure:"
        echo "   website-root/"
        echo "   ├── videos/"
        echo "   │   ├── NWS_001.mp4, NWS_001.webm, NWS_001.jpg"
        echo "   │   ├── NWS_002.mp4, NWS_002.webm, NWS_002.jpg"
        echo "   │   └── ..."
        echo "   └── dashboard/"
        echo "       └── index.html"
        echo ""
        echo "3. Test video access at:"
        echo "   https://www.natureswaysoil.com/videos/NWS_001.mp4"
        echo ""
        echo "Alternative deployment methods:"
        echo "- Vercel: Run 'vercel --prod' from deployment-package directory"
        echo "- GitHub Pages: Commit to main website repository"
        echo "- FTP: Upload deployment-package contents to server"
        ;;
        
    *)
        print_error "Invalid option selected"
        exit 1
        ;;
esac

echo ""
print_status "Deployment script completed!"

# Final verification instructions
echo ""
echo -e "${BLUE}🔍 Post-Deployment Verification:${NC}"
echo "Test these URLs after deployment:"
echo "  1. Video playback: https://www.natureswaysoil.com/videos/NWS_001.mp4"
echo "  2. Thumbnail images: https://www.natureswaysoil.com/videos/NWS_001.jpg"
echo "  3. Alternative dashboard: https://www.natureswaysoil.com/dashboard/"
echo ""
echo "If videos don't load, check:"
echo "  - File permissions (should be readable by web server)"
echo "  - MIME types configured for .mp4 and .webm files"
echo "  - CDN cache refresh if using a CDN"