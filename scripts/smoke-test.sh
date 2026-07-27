#!/usr/bin/env bash
set -euo pipefail

container_name="jove-gateway-smoke"
image_name="jove-gateway:ci"
host_port="3300"

cleanup() {
  docker rm -f "$container_name" >/dev/null 2>&1 || true
}

trap cleanup EXIT

cleanup

docker run -d \
  --name "$container_name" \
  -p "${host_port}:3000" \
  -e NODE_ENV=production \
  -e HOST=0.0.0.0 \
  -e PORT=3000 \
  -e LOG_LEVEL=warn \
  -e DEFAULT_PROVIDER=stub \
  "$image_name" >/dev/null

for _ in {1..20}; do
  if curl -fsS "http://127.0.0.1:${host_port}/health" >/dev/null; then
    curl -fsS "http://127.0.0.1:${host_port}/v1/models" >/dev/null
    echo "Smoke test passed"
    exit 0
  fi
  sleep 1
done

echo "Smoke test failed"
docker logs "$container_name" || true
exit 1
