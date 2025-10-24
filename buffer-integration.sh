#!/bin/bash
# Buffer Social Media Integration for Nature's Way Soil
# Automates posting of product videos to social media platforms

echo "🔗 Nature's Way Soil - Buffer Integration Setup"
echo "=============================================="

# Configuration
BUFFER_API_URL="https://api.bufferapp.com/1"
VIDEO_BASE_URL="https://natureswaysoil.github.io/best/videos"
WEBSITE_URL="https://www.natureswaysoil.com"

# Product data for social media posts
declare -A PRODUCTS=(
    ["NWS_001"]="Natural Liquid Fertilizer - Boost your garden naturally! 🌱"
    ["NWS_002"]="Horticultural Activated Charcoal - Improve soil drainage & health 🌿"
    ["NWS_003"]="Natural Tomato Liquid Fertilizer - Grow amazing tomatoes! 🍅"
    ["NWS_004"]="Soil Booster with Microbes - Healthy soil, healthy plants 🦠"
    ["NWS_006"]="Orchid Potting Mix - Perfect for your orchids 🌺"
    ["NWS_011"]="Hydroponic Liquid Fertilizer - Clean growing solution 💧"
    ["NWS_012"]="Dog Urine Lawn Neutralizer - Repair lawn damage fast 🐕"
    ["NWS_013"]="Enhanced Living Compost - Rich, organic nutrition 🍂"
    ["NWS_014"]="Pasture & Lawn Fertilizer - Green grass guaranteed 🌾"
    ["NWS_016"]="Natural Bone Meal - Organic phosphorus source 🦴"
    ["NWS_018"]="Liquid Kelp Fertilizer - Ocean nutrients for plants 🌊"
    ["NWS_021"]="Humic & Fulvic Acid - Enhanced nutrient absorption ⚡"
)

# Hashtags for each post type
HASHTAGS="#NaturesWaySoil #OrganicGardening #PlantHealth #GardenLife #SustainableGardening #PlantParent #GrowYourOwn #OrganicFertilizer #HealthySoil #GreenThumb"

check_dependencies() {
    echo "Checking dependencies..."
    
    if ! command -v curl &> /dev/null; then
        echo "❌ curl is required but not installed"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        echo "❌ jq is required but not installed. Install with: sudo apt install jq"
        exit 1
    fi
    
    echo "✅ Dependencies check passed"
}

setup_buffer_auth() {
    echo ""
    echo "🔐 Buffer API Authentication Setup"
    echo "================================="
    echo ""
    echo "To connect Buffer, you need to:"
    echo "1. Go to https://buffer.com/developers/api"
    echo "2. Create a new app or use existing one"
    echo "3. Get your Access Token"
    echo ""
    echo "Your Buffer Access Token will be stored securely in .env file"
    echo ""
    
    read -p "Enter your Buffer Access Token: " BUFFER_TOKEN
    
    if [ -z "$BUFFER_TOKEN" ]; then
        echo "❌ No token provided. Exiting."
        exit 1
    fi
    
    # Save to .env file
    echo "BUFFER_ACCESS_TOKEN=$BUFFER_TOKEN" > .env
    echo "✅ Buffer token saved to .env file"
    
    # Test authentication
    echo "Testing Buffer API connection..."
    response=$(curl -s -w "%{http_code}" -o /tmp/buffer_test.json \
        "$BUFFER_API_URL/user.json?access_token=$BUFFER_TOKEN")
    
    if [ "$response" = "200" ]; then
        echo "✅ Buffer API connection successful!"
        user_name=$(jq -r '.name' /tmp/buffer_test.json)
        echo "   Authenticated as: $user_name"
    else
        echo "❌ Buffer API connection failed (HTTP $response)"
        echo "   Please check your access token"
        exit 1
    fi
}

get_buffer_profiles() {
    source .env
    echo ""
    echo "📱 Getting your Buffer social media profiles..."
    
    curl -s "$BUFFER_API_URL/profiles.json?access_token=$BUFFER_ACCESS_TOKEN" | \
        jq -r '.[] | "\(.service) - \(.username) (ID: \(.id))"' | \
        tee buffer_profiles.txt
    
    echo ""
    echo "✅ Profiles saved to buffer_profiles.txt"
    echo "Copy the profile IDs you want to post to"
}

create_post_template() {
    cat > post_template.json << 'EOF'
{
    "text": "{{MESSAGE}}",
    "media": {
        "link": "{{VIDEO_URL}}",
        "thumbnail": "{{THUMBNAIL_URL}}"
    },
    "profile_ids": ["{{PROFILE_ID}}"],
    "scheduled_at": null,
    "now": true
}
EOF
    echo "✅ Post template created: post_template.json"
}

create_social_post() {
    local product_id="$1"
    local profile_id="$2"
    local custom_message="$3"
    
    source .env
    
    if [ -z "$product_id" ] || [ -z "$profile_id" ]; then
        echo "Usage: create_social_post <PRODUCT_ID> <PROFILE_ID> [custom_message]"
        echo "Example: create_social_post NWS_001 5a1b2c3d4e5f6g7h8i9j"
        return 1
    fi
    
    # Get product description
    product_desc="${PRODUCTS[$product_id]}"
    if [ -z "$product_desc" ]; then
        echo "❌ Unknown product ID: $product_id"
        return 1
    fi
    
    # Use custom message or default
    if [ -n "$custom_message" ]; then
        message="$custom_message"
    else
        message="🌱 $product_desc

🎥 Watch it in action!
🛒 Shop now: $WEBSITE_URL
        
$HASHTAGS"
    fi
    
    # URLs for media
    video_url="$VIDEO_BASE_URL/${product_id}.mp4"
    thumbnail_url="$VIDEO_BASE_URL/${product_id}.jpg"
    
    # Create post data
    post_data=$(cat post_template.json | \
        sed "s|{{MESSAGE}}|$message|g" | \
        sed "s|{{VIDEO_URL}}|$video_url|g" | \
        sed "s|{{THUMBNAIL_URL}}|$thumbnail_url|g" | \
        sed "s|{{PROFILE_ID}}|$profile_id|g")
    
    echo "Creating social media post for $product_id..."
    echo "Message preview:"
    echo "$message"
    echo ""
    
    # Send to Buffer
    response=$(curl -s -w "%{http_code}" -o /tmp/buffer_post.json \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$post_data" \
        "$BUFFER_API_URL/updates/create.json?access_token=$BUFFER_ACCESS_TOKEN")
    
    if [ "$response" = "200" ]; then
        echo "✅ Post created successfully!"
        post_id=$(jq -r '.id' /tmp/buffer_post.json)
        echo "   Post ID: $post_id"
    else
        echo "❌ Failed to create post (HTTP $response)"
        echo "   Error details:"
        jq '.' /tmp/buffer_post.json 2>/dev/null || cat /tmp/buffer_post.json
    fi
}

schedule_campaign() {
    echo ""
    echo "📅 Scheduling Product Video Campaign"
    echo "==================================="
    
    read -p "Enter Buffer Profile ID for posting: " PROFILE_ID
    read -p "How many hours between posts? (default: 24): " HOURS_BETWEEN
    HOURS_BETWEEN=${HOURS_BETWEEN:-24}
    
    echo ""
    echo "🚀 Starting automated campaign..."
    
    counter=0
    for product_id in "${!PRODUCTS[@]}"; do
        echo "Scheduling post $((counter + 1))/12 for $product_id..."
        
        if [ $counter -eq 0 ]; then
            # Post first one immediately
            create_social_post "$product_id" "$PROFILE_ID"
        else
            # Schedule others
            schedule_time=$((counter * HOURS_BETWEEN))
            echo "   Will post in $schedule_time hours"
            # Note: Buffer free plan may not support scheduling
            # You would need Buffer Pro for automated scheduling
        fi
        
        ((counter++))
        sleep 2  # Rate limiting
    done
    
    echo ""
    echo "✅ Campaign setup complete!"
    echo "   Posts will be spaced $HOURS_BETWEEN hours apart"
}

show_help() {
    echo ""
    echo "🔧 Available Commands:"
    echo "====================="
    echo ""
    echo "./buffer-integration.sh setup          - Initial Buffer API setup"
    echo "./buffer-integration.sh profiles       - List your social media profiles"  
    echo "./buffer-integration.sh post <ID> <PROFILE> [message] - Create single post"
    echo "./buffer-integration.sh campaign       - Schedule full product campaign"
    echo "./buffer-integration.sh help           - Show this help"
    echo ""
    echo "Examples:"
    echo "  ./buffer-integration.sh post NWS_001 5a1b2c3d4e5f6g7h8i9j"
    echo "  ./buffer-integration.sh post NWS_013 5a1b2c3d4e5f6g7h8i9j 'Check out our amazing compost! 🍂'"
    echo ""
    echo "Available Product IDs:"
    for product_id in "${!PRODUCTS[@]}"; do
        echo "  $product_id - ${PRODUCTS[$product_id]}"
    done | sort
}

# Main execution
case "$1" in
    "setup")
        check_dependencies
        setup_buffer_auth
        create_post_template
        echo ""
        echo "✅ Setup complete! Next steps:"
        echo "1. Run: ./buffer-integration.sh profiles"
        echo "2. Copy a profile ID"
        echo "3. Test: ./buffer-integration.sh post NWS_001 <PROFILE_ID>"
        ;;
    "profiles")
        get_buffer_profiles
        ;;
    "post")
        create_social_post "$2" "$3" "$4"
        ;;
    "campaign")
        schedule_campaign
        ;;
    "help"|"")
        show_help
        ;;
    *)
        echo "❌ Unknown command: $1"
        show_help
        exit 1
        ;;
esac