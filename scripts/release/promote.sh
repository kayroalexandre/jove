#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${1:-}" ]]; then
  echo "Usage: ./scripts/release/promote.sh <version>"
  exit 1
fi

version="$1"
tag="v${version#v}"

bun run validate
bun run release:plan || true

git fetch origin
git checkout main
git pull --ff-only origin main
git tag -a "$tag" -m "release: $tag"
git push origin "$tag"

echo "Release tag enviada: $tag"
