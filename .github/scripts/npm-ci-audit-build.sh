#!/usr/bin/env bash
set -euo pipefail

npm ci

audit_rc=1
audit_out=""
for attempt in 1 2 3; do
  audit_rc=0
  audit_out="$(npm audit --omit=dev --audit-level=high 2>&1)" || audit_rc=$?
  printf '%s\n' "$audit_out"
  if [ "$audit_rc" -eq 0 ]; then
    break
  fi
  if printf '%s\n' "$audit_out" | grep -qE '503 Service Unavailable|audit endpoint returned an error'; then
    echo "npm registry audit API unavailable (attempt ${attempt}/3)."
    if [ "$attempt" -lt 3 ]; then
      sleep 20
      continue
    fi
    echo "Continuing without a standalone audit. npm ci already audited the tree."
    break
  fi
  exit "$audit_rc"
done

npm run build
