#!/bin/bash

# Interactive Token Update Script
# Use this to quickly update expired social media tokens

PROJECT="natureswaysoil-video"

echo "🔐 Social Media Token Updater"
echo "================================"
echo ""
echo "Current Status:"
echo "✅ YouTube: WORKING"
echo "❌ Twitter: NEEDS UPDATE"  
echo "❌ Pinterest: NEEDS UPDATE"
echo "❌ Instagram: NEEDS UPDATE"
echo ""

read -p "Which platform do you want to update? (twitter/pinterest/instagram/all): " PLATFORM

update_twitter() {
    echo ""
    echo "📝 Twitter Token Update"
    echo "----------------------"
    echo "Go to: https://developer.twitter.com/en/portal/dashboard"
    echo "Navigate to your app > Keys and tokens > Regenerate all"
    echo ""
    
    read -p "Enter new TWITTER_API_KEY: " API_KEY
    read -p "Enter new TWITTER_API_SECRET: " API_SECRET
    read -p "Enter new TWITTER_ACCESS_TOKEN: " ACCESS_TOKEN
    read -p "Enter new TWITTER_ACCESS_SECRET: " ACCESS_SECRET
    read -p "Enter new TWITTER_BEARER_TOKEN: " BEARER_TOKEN
    
    echo ""
    echo "Updating Twitter secrets..."
    echo -n "$API_KEY" | gcloud secrets versions add TWITTER_API_KEY --data-file=- --project=$PROJECT
    echo -n "$API_SECRET" | gcloud secrets versions add TWITTER_API_SECRET --data-file=- --project=$PROJECT
    echo -n "$ACCESS_TOKEN" | gcloud secrets versions add TWITTER_ACCESS_TOKEN --data-file=- --project=$PROJECT
    echo -n "$ACCESS_SECRET" | gcloud secrets versions add TWITTER_ACCESS_SECRET --data-file=- --project=$PROJECT
    echo -n "$BEARER_TOKEN" | gcloud secrets versions add TWITTER_BEARER_TOKEN --data-file=- --project=$PROJECT
    echo "✅ Twitter tokens updated!"
}

update_pinterest() {
    echo ""
    echo "📝 Pinterest Token Update"
    echo "------------------------"
    echo "Go to: https://developers.pinterest.com/apps/"
    echo "Select your app > Generate access token"
    echo "Required scopes: pins:read, pins:write, boards:read, boards:write"
    echo ""
    
    read -p "Enter new PINTEREST_ACCESS_TOKEN: " PIN_TOKEN
    
    echo ""
    echo "Updating Pinterest secret..."
    echo -n "$PIN_TOKEN" | gcloud secrets versions add PINTEREST_ACCESS_TOKEN --data-file=- --project=$PROJECT
    echo "✅ Pinterest token updated!"
}

update_instagram() {
    echo ""
    echo "📝 Instagram Token Update"
    echo "------------------------"
    echo "Go to: https://developers.facebook.com/tools/explorer/"
    echo "1. Select your Facebook App"
    echo "2. Click 'Get Token' > 'Get User Access Token'"
    echo "3. Select permissions: instagram_basic, instagram_content_publish"
    echo "4. Copy the SHORT-LIVED token"
    echo ""
    
    read -p "Enter SHORT-LIVED Instagram token: " SHORT_TOKEN
    read -p "Enter your Facebook App ID: " FB_APP_ID
    read -p "Enter your Facebook App Secret: " FB_APP_SECRET
    
    echo ""
    echo "Exchanging for long-lived token..."
    
    LONG_TOKEN=$(curl -s "https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=$FB_APP_ID&client_secret=$FB_APP_SECRET&fb_exchange_token=$SHORT_TOKEN" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    
    if [ -n "$LONG_TOKEN" ]; then
        echo "Updating Instagram secret..."
        echo -n "$LONG_TOKEN" | gcloud secrets versions add INSTAGRAM_ACCESS_TOKEN --data-file=- --project=$PROJECT
        echo "✅ Instagram token updated (60-day expiration)!"
        echo "   Set a reminder to refresh again in 50 days"
    else
        echo "❌ Failed to exchange token. Update manually:"
        echo "   echo -n 'YOUR_LONG_LIVED_TOKEN' | gcloud secrets versions add INSTAGRAM_ACCESS_TOKEN --data-file=- --project=$PROJECT"
    fi
}

case $PLATFORM in
    twitter)
        update_twitter
        ;;
    pinterest)
        update_pinterest
        ;;
    instagram)
        update_instagram
        ;;
    all)
        update_twitter
        update_pinterest
        update_instagram
        ;;
    *)
        echo "Invalid platform. Choose: twitter, pinterest, instagram, or all"
        exit 1
        ;;
esac

echo ""
echo "✨ Done! Now test the credentials:"
echo "   cd /workspaces/best/automation/video-system/upstream"
echo "   node quick-check.js"
echo ""
echo "If all show ✅, run a test job:"
echo "   gcloud run jobs execute natureswaysoil-video-job --region=us-east1 --project=$PROJECT --wait"
