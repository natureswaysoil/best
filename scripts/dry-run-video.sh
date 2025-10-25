#!/usr/bin/env bash
set -euo pipefail

# Run a dry-run of the upstream video system to validate local setup without posting.
# Assumes submodule at automation/video-system/upstream

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
UPSTREAM_DIR="$ROOT_DIR/automation/video-system/upstream"

if [[ ! -d "$UPSTREAM_DIR" ]]; then
  echo "ERROR: Upstream directory not found: $UPSTREAM_DIR" >&2
  exit 1
fi

pushd "$UPSTREAM_DIR" >/dev/null

if [[ ! -f package.json ]]; then
  echo "ERROR: No package.json found in upstream; please check submodule checkout" >&2
  exit 1
fi

# Install deps if node_modules missing
if [[ ! -d node_modules ]]; then
  echo "Installing dependencies..."
  npm ci
fi

export RUN_ONCE=true
export DRY_RUN_LOG_ONLY=true

# Derive CSV export URL from our mapping file
MAP_FILE="$ROOT_DIR/automation/video-system/heygen-mapping.json"
if [[ -f "$MAP_FILE" ]]; then
  SHEET_URL=$(jq -r '.sheet.spreadsheetUrl' "$MAP_FILE")
  SHEET_GID=$(jq -r '.sheet.gid' "$MAP_FILE")
  if [[ -n "$SHEET_URL" && -n "$SHEET_GID" && "$SHEET_URL" != "null" && "$SHEET_GID" != "null" ]]; then
    # Convert edit URL to CSV export
    # Examples:
    # https://docs.google.com/spreadsheets/d/<ID>/edit?gid=<GID>#gid=<GID>
    # -> https://docs.google.com/spreadsheets/d/<ID>/export?format=csv&gid=<GID>
    CSV_URL=$(echo "$SHEET_URL" | sed -E 's|/edit\?gid=([0-9]+).*|/export?format=csv\&gid='"$SHEET_GID"'|')
    export CSV_URL
    echo "Using CSV_URL from mapping: $CSV_URL"
  fi
fi

# Fallback if not set
if [[ -z "${CSV_URL:-}" ]]; then
  export CSV_URL="https://docs.google.com/spreadsheets/d/1LU2ahpzMqLB5FLYqiyDbXOfjTxbdp8U8/export?format=csv&gid=1712974299"
  echo "Using default CSV_URL: $CSV_URL"
fi

# Run the compiled CLI directly
if [[ -f dist/cli.js ]]; then
  echo "Running: node dist/cli.js (RUN_ONCE, DRY_RUN_LOG_ONLY)"
  node dist/cli.js
else
  echo "ERROR: dist/cli.js not found. Try: npm run build" >&2
  exit 2
fi

popd >/dev/null

echo "Dry-run complete. Check logs for any errors and verify Sheet writeback if configured."
