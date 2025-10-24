#!/usr/bin/env bash
set -euo pipefail

# Deploy this static site to Vercel.
# Requirements:
#  - Node.js and npm installed
#  - Vercel CLI installed (`npm i -g vercel`) or use `npx vercel`
#  - Logged in to Vercel (`vercel login`) or set VERCEL_TOKEN env var
# Usage:
#  ./scripts/deploy-vercel.sh           # preview deployment
#  ./scripts/deploy-vercel.sh --prod    # production deployment

pushd "$(dirname "$0")/.." >/dev/null

if ! command -v vercel >/dev/null 2>&1; then
  echo "Vercel CLI not found. Installing locally with npx..." >&2
  npx vercel --version >/dev/null
fi

ARGS=( )
if [[ ${1:-} == "--prod" ]]; then
  ARGS+=("--prod")
fi

# Ensure vercel.json exists
if [[ ! -f vercel.json ]]; then
  echo "vercel.json not found in repo root. Aborting." >&2
  exit 1
fi

echo "Starting Vercel deployment..."
# First run may ask to create/link project; follow prompts
npx vercel ${ARGS[@]} --confirm

popd >/dev/null
