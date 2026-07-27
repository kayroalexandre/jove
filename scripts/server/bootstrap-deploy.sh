#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${1:-}" ]]; then
  echo "Usage: ./scripts/server/bootstrap-deploy.sh <deploy-path>"
  exit 1
fi

deploy_path="$1"
mkdir -p "$deploy_path"
cp docker-compose.release.yml "$deploy_path/"

echo "Arquivos copiados para $deploy_path"
echo "Crie manualmente o arquivo .env no servidor antes do primeiro deploy"
