#!/bin/bash
# Video Integration Status Check
# This script checks the status of runway video integration

set +e  # Don't exit on error, we want to show all status

VIDEOS_DIR="/home/runner/work/best/best/public/videos"
SOURCE_DIR="/home/ubuntu/runway_videos"

echo "=========================================="
echo "Runway Video Integration Status"
echo "=========================================="
echo ""

# Check if source directory is accessible
echo "📁 Checking source directory..."
if [ -d "$SOURCE_DIR" ]; then
    echo "✅ Source directory exists: $SOURCE_DIR"
    VIDEO_COUNT=$(ls -1 "$SOURCE_DIR"/Parent_*.mp4 2>/dev/null | wc -l)
    echo "   Found $VIDEO_COUNT source videos"
else
    echo "⚠️  Source directory not accessible: $SOURCE_DIR"
    echo "   Videos must be copied from the machine where they are stored"
fi
echo ""

# Check destination directory
echo "📹 Checking destination directory..."
if [ ! -d "$VIDEOS_DIR" ]; then
    echo "❌ Destination directory missing: $VIDEOS_DIR"
    exit 1
else
    echo "✅ Destination directory exists: $VIDEOS_DIR"
fi
echo ""

# List of expected videos
declare -a EXPECTED_VIDEOS=(
    "NWS_001:B0822RH5L3:Natural Liquid Fertilizer"
    "NWS_002:B0D52CQNGN:Activated Charcoal"
    "NWS_003:B0D6886G54:Tomato Fertilizer"
    "NWS_004:B0D69LNC5T:Soil Booster"
    "NWS_012:B0F9W7B3NL:Bone Meal"
    "NWS_013:B0DDCPYLG1:Living Compost"
    "NWS_014:B0FG38PQQX:Dog Urine Neutralizer"
    "NWS_016:B0D9HT7ND8:Hydroponic Fertilizer"
    "NWS_021:B0DJ1JNQW4:Horse Safe Fertilizer"
    "NWS_022:B0D7T3TLQP:Orchid Mix (NEW)"
    "NWS_023:B0D7V76PLY:Orchid Fertilizer (NEW)"
    "NWS_024:B0F4NQNTSW:Spray Indicator (NEW)"
)

echo "🎬 Video Status Check:"
echo ""

FOUND=0
MISSING=0

for entry in "${EXPECTED_VIDEOS[@]}"; do
    IFS=':' read -r ID ASIN NAME <<< "$entry"
    
    if [ -f "$VIDEOS_DIR/$ID.mp4" ]; then
        echo "  ✅ $ID.mp4 - $NAME"
        ((FOUND++))
    else
        echo "  ❌ $ID.mp4 - $NAME (MISSING)"
        echo "     Source: $SOURCE_DIR/Parent_${ASIN}_video.mp4"
        ((MISSING++))
    fi
done

echo ""
echo "=========================================="
echo "Summary:"
echo "  Total videos expected: ${#EXPECTED_VIDEOS[@]}"
echo "  Videos found: $FOUND"
echo "  Videos missing: $MISSING"
echo "=========================================="
echo ""

if [ $MISSING -gt 0 ]; then
    echo "⚠️  Action Required:"
    echo ""
    echo "1. Copy videos from source location:"
    echo "   ./scripts/copy-runway-videos.sh"
    echo ""
    echo "2. Or manually copy each video:"
    echo "   cp $SOURCE_DIR/Parent_<ASIN>_video.mp4 $VIDEOS_DIR/NWS_<ID>.mp4"
    echo ""
    echo "3. Then verify: ./scripts/check-video-status.sh"
    echo ""
else
    echo "✅ All videos are in place!"
    echo ""
    echo "Next steps:"
    echo "1. Test the website: npm run dev"
    echo "2. Visit product pages to verify videos play correctly"
    echo "3. Optional: Generate WebM versions for better browser support"
fi
