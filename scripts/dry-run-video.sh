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

export DRY_RUN=true
export RUN_ONCE=true

# Try common scripts/entrypoints
if npm run | grep -q "generate:dry-run"; then
  echo "Running: npm run generate:dry-run"
  npm run generate:dry-run
elif npm run | grep -q "start:dry-run"; then
  echo "Running: npm run start:dry-run"
  npm run start:dry-run
else
  # Fallback to a typical CLI path (adjust as upstream evolves)
  if [[ -f dist/cli.js ]]; then
    echo "Running: node dist/cli.js --dry-run --once"
    node dist/cli.js --dry-run --once
  else
    echo "ERROR: No known dry-run entrypoint found. Please update scripts/dry-run-video.sh to match upstream commands." >&2
    exit 2
  fi
fi

popd >/dev/null

echo "Dry-run complete. Check logs for any errors and verify Sheet writeback if configured."
