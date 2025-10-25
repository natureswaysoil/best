#!/usr/bin/env bash
set -euo pipefail

# Import product videos into public/videos from a JSON list.
# JSON shape: [ { asin, parent_asin, title, price, video_path } ... ]
#
# Usage:
#   ./scripts/import-videos.sh path/to/list.json [--symlink]
#
# Behavior:
# - Copies (or symlinks with --symlink) each item's video_path to public/videos/<asin>.mp4
# - Generates public/videos/index.json for files that were found/copied
# - Skips entries whose source files are missing and prints a warning

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
LIST_FILE=${1:-}
MODE_COPY=true
if [[ ${2:-} == "--symlink" ]]; then
  MODE_COPY=false
fi

if [[ -z "$LIST_FILE" ]]; then
  echo "Usage: $0 path/to/list.json [--symlink]" >&2
  exit 1
fi
if [[ ! -f "$LIST_FILE" ]]; then
  echo "List file not found: $LIST_FILE" >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required. Please install jq." >&2
  exit 1
fi

DEST_DIR="$ROOT_DIR/public/videos"
mkdir -p "$DEST_DIR"

tmp_index=$(mktemp)
echo '[]' >"$tmp_index"

count_total=$(jq 'length' "$LIST_FILE")
echo "Importing videos from $LIST_FILE (items: $count_total)"

for i in $(seq 0 $((count_total-1))); do
  item=$(jq -r ".[$i]" "$LIST_FILE")
  asin=$(jq -r '.asin' <<<"$item")
  title=$(jq -r '.title' <<<"$item")
  price=$(jq -r '.price' <<<"$item")
  src=$(jq -r '.video_path' <<<"$item")

  if [[ -z "$asin" || "$asin" == "null" ]]; then
    echo "[WARN] Missing asin for item index $i, skipping" >&2
    continue
  fi
  if [[ -z "$src" || "$src" == "null" ]]; then
    echo "[WARN] Missing video_path for ASIN $asin, skipping" >&2
    continue
  fi
  if [[ ! -f "$src" ]]; then
    echo "[WARN] Source not found for ASIN $asin: $src" >&2
    continue
  fi

  dest="$DEST_DIR/${asin}.mp4"
  if $MODE_COPY; then
    cp -f "$src" "$dest"
  else
    ln -sfn "$src" "$dest"
  fi
  rel="videos/${asin}.mp4"
  echo "[OK] ${asin} -> $rel"

  # Append to index array
  tmp=$(mktemp)
  jq --arg asin "$asin" --arg title "$title" --arg price "$price" --arg src "$rel" \
     '. += [{asin:$asin,title:$title,price:$price,src:$src}]' "$tmp_index" >"$tmp"
  mv "$tmp" "$tmp_index"
done

if [[ -s "$tmp_index" ]]; then
  mv "$tmp_index" "$DEST_DIR/index.json"
  echo "Wrote index: $DEST_DIR/index.json"
else
  rm -f "$tmp_index"
fi

echo "Done."
