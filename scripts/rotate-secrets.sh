#!/bin/bash
# Script to help rotate secrets safely

set -e

echo "🔐 Secret Rotation Helper"
echo "=========================="
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for required tools
echo "Checking for required tools..."
if ! command_exists git; then
    echo "❌ Error: git is not installed"
    exit 1
fi

echo "✅ All required tools are available"
echo ""

# Display current secrets that need rotation
echo "📋 Secrets that should be stored in environment variables:"
echo ""
echo "Google Cloud SDK:"
echo "  - GCLOUD_ERROR_REPORTING_API_KEY"
echo "  - GCLOUD_CRASH_REPORTING_API_KEY"
echo "  - GSUTIL_ANONYMOUS_API_KEY"
echo ""
echo "Application (from .env.local.example):"
echo "  - STRIPE_SECRET_KEY"
echo "  - SUPABASE_SERVICE_ROLE_KEY"
echo "  - RESEND_API_KEY"
echo "  - HEYGEN_API_KEY"
echo "  - GOOGLE_ADS_DEVELOPER_TOKEN"
echo "  - GOOGLE_ADS_CLIENT_SECRET"
echo "  - GOOGLE_ADS_REFRESH_TOKEN"
echo "  - META_ACCESS_TOKEN"
echo "  - PINTEREST_ACCESS_TOKEN"
echo ""

# Check if there are any secrets in the codebase
echo "🔍 Scanning for potential secrets in code..."
if grep -rE "AIzaSy[a-zA-Z0-9_-]{33}" \
    --include="*.py" \
    --include="*.js" \
    --include="*.mjs" \
    --include="*.ts" \
    --include="*.tsx" \
    --exclude-dir=node_modules \
    --exclude-dir=.git \
    . 2>/dev/null; then
    echo ""
    echo "⚠️  WARNING: Potential API keys found in code!"
    echo "Please remove these and use environment variables instead."
else
    echo "✅ No obvious API key patterns detected in code"
fi

echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Rotate secrets in their respective services:"
echo "   - Google Cloud Console (https://console.cloud.google.com/apis/credentials)"
echo "   - Stripe Dashboard (https://dashboard.stripe.com/apikeys)"
echo "   - Supabase Dashboard (https://app.supabase.com)"
echo ""
echo "2. Update environment variables:"
echo "   - Local: Update .env.local"
echo "   - Vercel: Update in Vercel Dashboard"
echo "   - Google Cloud: Update in Secret Manager"
echo "   - GitHub Actions: Update in Repository Secrets"
echo ""
echo "3. If secrets were committed to git history, clean the history:"
echo "   See SECURITY.md for detailed instructions"
echo ""
echo "4. Notify team members to:"
echo "   - Pull the latest changes"
echo "   - Update their local .env.local files"
echo "   - Re-clone if git history was rewritten"
echo ""
