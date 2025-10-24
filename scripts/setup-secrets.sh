#!/usr/bin/env bash
set -euo pipefail

# Setup required secrets in Google Secret Manager for project amazon-ppc-474902
# Usage:
#   export HEYGEN_API_KEY=...        # required
#   export OPENAI_API_KEY=...        # required
#   export GOOGLE_SHEETS_SA_JSON=... # required (full JSON string or path to file)
#   export BUFFER_ACCESS_TOKEN=...   # optional (only if posting directly via Buffer API)
#   ./scripts/setup-secrets.sh
#
# Notes:
# - Requires gcloud CLI with access to project amazon-ppc-474902
# - If GOOGLE_SHEETS_SA_JSON is a filepath, the script will read it; otherwise it treats it as raw JSON

PROJECT_ID=${PROJECT_ID:-amazon-ppc-474902}

require_var() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "ERROR: missing required env var: $name" >&2
    exit 1
  fi
}

create_or_update_secret() {
  local name="$1"
  local payload="$2"
  if gcloud secrets describe "$name" --project "$PROJECT_ID" >/dev/null 2>&1; then
    echo "Updating secret $name"
    printf "%s" "$payload" | gcloud secrets versions add "$name" --project "$PROJECT_ID" --data-file=- >/dev/null
  else
    echo "Creating secret $name"
    printf "%s" "$payload" | gcloud secrets create "$name" --project "$PROJECT_ID" --data-file=- >/dev/null
  fi
}

main() {
  require_var HEYGEN_API_KEY
  require_var OPENAI_API_KEY
  require_var GOOGLE_SHEETS_SA_JSON

  # Normalize Sheets SA JSON payload
  if [[ -f "$GOOGLE_SHEETS_SA_JSON" ]]; then
    SA_PAYLOAD=$(cat "$GOOGLE_SHEETS_SA_JSON")
  else
    SA_PAYLOAD="$GOOGLE_SHEETS_SA_JSON"
  fi

  create_or_update_secret HEYGEN_API_KEY "$HEYGEN_API_KEY"
  create_or_update_secret OPENAI_API_KEY "$OPENAI_API_KEY"
  create_or_update_secret GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON "$SA_PAYLOAD"

  if [[ -n "${BUFFER_ACCESS_TOKEN:-}" ]]; then
    create_or_update_secret BUFFER_ACCESS_TOKEN "$BUFFER_ACCESS_TOKEN"
  fi

  echo "Secrets provisioned in project: $PROJECT_ID"
  echo "- HEYGEN_API_KEY"
  echo "- OPENAI_API_KEY"
  echo "- GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON"
  if [[ -n "${BUFFER_ACCESS_TOKEN:-}" ]]; then
    echo "- BUFFER_ACCESS_TOKEN"
  fi
}

main "$@"
