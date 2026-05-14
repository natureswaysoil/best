#!/bin/bash
# Script to copy runway-generated videos to the website's public/videos directory
# This script maps parent ASIN videos to NWS product IDs

set -e

SOURCE_DIR="/home/ubuntu/runway_videos"
DEST_DIR="/home/runner/work/best/best/public/videos"

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "=================================="
echo "Runway Video Copy Script"
echo "=================================="
echo ""

# Check if source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo -e "${RED}ERROR: Source directory $SOURCE_DIR does not exist${NC}"
    echo "This script should be run on a machine that has access to the runway videos."
    echo ""
    echo "To use this script:"
    echo "1. Copy this script to the machine with runway videos"
    echo "2. Ensure the videos are in: $SOURCE_DIR"
    echo "3. Run: bash copy-runway-videos.sh"
    exit 1
fi

# Check if destination directory exists
if [ ! -d "$DEST_DIR" ]; then
    echo -e "${YELLOW}WARNING: Destination directory $DEST_DIR does not exist${NC}"
    echo "Creating destination directory..."
    mkdir -p "$DEST_DIR"
fi

# Video mappings: parent_asin => product_id
declare -A VIDEO_MAP
VIDEO_MAP["B0822RH5L3"]="NWS_001"
VIDEO_MAP["B0D52CQNGN"]="NWS_002"
VIDEO_MAP["B0D6886G54"]="NWS_003"
VIDEO_MAP["B0D69LNC5T"]="NWS_004"
VIDEO_MAP["B0D7T3TLQP"]="NWS_022"  # NEW
VIDEO_MAP["B0D7V76PLY"]="NWS_023"  # NEW
VIDEO_MAP["B0D9HT7ND8"]="NWS_016"
VIDEO_MAP["B0FG38PQQX"]="NWS_014"
VIDEO_MAP["B0DDCPYLG1"]="NWS_013"
VIDEO_MAP["B0DJ1JNQW4"]="NWS_021"
VIDEO_MAP["B0F9W7B3NL"]="NWS_012"
VIDEO_MAP["B0F4NQNTSW"]="NWS_024"  # NEW

echo "Starting video copy process..."
echo ""

COPIED=0
FAILED=0

for PARENT_ASIN in "${!VIDEO_MAP[@]}"; do
    PRODUCT_ID="${VIDEO_MAP[$PARENT_ASIN]}"
    SOURCE_FILE="$SOURCE_DIR/Parent_${PARENT_ASIN}_video.mp4"
    DEST_FILE="$DEST_DIR/${PRODUCT_ID}.mp4"
    
    if [ -f "$SOURCE_FILE" ]; then
        echo -e "${GREEN}✓${NC} Copying $PARENT_ASIN => $PRODUCT_ID"
        cp "$SOURCE_FILE" "$DEST_FILE"
        ((COPIED++))
    else
        echo -e "${RED}✗${NC} Missing: $SOURCE_FILE"
        ((FAILED++))
    fi
done

echo ""
echo "=================================="
echo "Summary:"
echo "  Copied: $COPIED videos"
echo "  Failed: $FAILED videos"
echo "=================================="
echo ""

if [ $FAILED -gt 0 ]; then
    echo -e "${YELLOW}WARNING: Some videos were not copied. Check the source directory.${NC}"
    exit 1
fi

echo -e "${GREEN}SUCCESS: All videos copied successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Generate WebM versions: npm run videos:convert"
echo "2. Generate poster images: npm run videos:posters"
echo "3. Test the website: npm run dev"
