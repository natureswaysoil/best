#!/bin/bash
# Pre-commit hook to check for exposed Google API keys

if grep -rE "AIzaSy[a-zA-Z0-9_-]{33}" \
    --include="*.py" \
    --include="*.js" \
    --include="*.mjs" \
    --include="*.ts" \
    --include="*.tsx" \
    --exclude-dir=node_modules \
    --exclude-dir=.git \
    . 2>/dev/null | grep -v "os.environ.get"; then
    echo "ERROR: Google API key detected in code!"
    echo "Please use environment variables instead of hardcoding keys."
    exit 1
fi

exit 0
