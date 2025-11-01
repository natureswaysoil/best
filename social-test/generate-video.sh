#!/bin/bash

# Generate a proper video file for YouTube using FFmpeg
# Creates a 10-second video with Nature's Way Soil branding

OUTPUT="${1:-nature-way-soil-test.mp4}"
DURATION="${2:-10}"

echo "🎬 Generating video: $OUTPUT (${DURATION}s)"

# Generate a proper H.264 video with:
# - Green background (organic/nature theme)
# - White text with Nature's Way Soil branding
# - Audio tone (YouTube requires audio track)
# - 1280x720 resolution (720p)
# - 30fps

ffmpeg -y \
  -f lavfi -i color=c=darkgreen:s=1280x720:d=$DURATION \
  -f lavfi -i "sine=frequency=440:duration=$DURATION" \
  -vf "drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:\
text='Nature'\''s Way Soil':fontcolor=white:fontsize=80:x=(w-text_w)/2:y=h/2-100,\
drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:\
text='Transform Your Garden Naturally':fontcolor=white:fontsize=40:x=(w-text_w)/2:y=h/2+50,\
drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:\
text='Organic Soil Amendments':fontcolor=white:fontsize=30:x=(w-text_w)/2:y=h/2+120" \
  -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p \
  -c:a aac -b:a 128k -ar 44100 \
  -t $DURATION \
  -movflags +faststart \
  "$OUTPUT"

if [ $? -eq 0 ]; then
  echo "✅ Video generated successfully: $OUTPUT"
  ls -lh "$OUTPUT"
  
  # Show video info
  ffprobe -v quiet -print_format json -show_format -show_streams "$OUTPUT" | jq -r '.format | "Duration: \(.duration)s, Size: \(.size) bytes, Format: \(.format_name)"'
else
  echo "❌ Video generation failed"
  exit 1
fi
