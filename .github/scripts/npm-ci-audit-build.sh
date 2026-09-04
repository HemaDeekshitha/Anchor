#!/usr/bin/env bash
set -euo pipefail

# --no-audit: npm ci otherwise calls the registry audit API, which has been
# returning 503 and stretching a 1-minute install into 3–10 minutes.
# --prefer-offline: use the Actions npm cache when it restored.
npm ci --no-audit --prefer-offline
npm run build
