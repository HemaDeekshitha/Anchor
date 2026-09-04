#!/usr/bin/env bash
set -Eeuo pipefail

readonly WAIT_SECONDS="${DEPLOY_WAIT_SECONDS:-300}"
readonly POLL_SECONDS=2
readonly SERVICES=(postgres redis backend community-worker frontend website)
readonly DEPLOY_DEADLINE=$((SECONDS + WAIT_SECONDS))

compose() {
  docker compose "$@"
}

show_diagnostics() {
  local service="$1"
  echo "::group::${service} diagnostics"
  compose ps "$service" || true
  compose logs --no-color --tail 200 "$service" || true
  echo "::endgroup::"
}

wait_for_service() {
  local service="$1"
  local container_id=""
  local state=""
  local health=""

  while (( SECONDS < DEPLOY_DEADLINE )); do
    container_id="$(compose ps --all -q "$service" 2>/dev/null || true)"
    if [[ -n "$container_id" ]]; then
      state="$(docker inspect --format '{{.State.Status}}' "$container_id" 2>/dev/null || true)"
      health="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$container_id" 2>/dev/null || true)"

      if [[ "$state" == "running" && ( "$health" == "healthy" || "$health" == "none" ) ]]; then
        echo "${service} is ready (state=${state}, health=${health})."
        return 0
      fi
      if [[ "$state" == "exited" || "$state" == "dead" ]]; then
        echo "${service} stopped before becoming ready (state=${state}, health=${health})."
        show_diagnostics "$service"
        return 1
      fi
    fi
    sleep "$POLL_SECONDS"
  done

  echo "Timed out waiting for ${service} (state=${state:-missing}, health=${health:-unknown})."
  show_diagnostics "$service"
  return 1
}

compose config --quiet

failed=0
for service in "${SERVICES[@]}"; do
  if ! wait_for_service "$service"; then
    failed=1
  fi
done

if (( failed != 0 )); then
  echo "One or more production services failed readiness checks."
  compose ps || true
  exit 1
fi

echo "Deployment ready: PostgreSQL, Redis, API, queue worker, and both frontends are healthy."
