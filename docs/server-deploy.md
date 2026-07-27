# Deploy contínuo no servidor

## Pré-requisitos no servidor

- Docker e Docker Compose instalados
- usuário com permissão para Docker
- diretório de deploy, por exemplo `/opt/jove`
- arquivo `.env` presente no servidor e fora do Git
- arquivo `docker-compose.release.yml` copiado para o diretório de deploy

## Secrets do GitHub Actions

Configure no repositório ou por ambiente:

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY`
- `DEPLOY_PATH`
- `GHCR_READ_TOKEN`

> `GHCR_READ_TOKEN` deve ter permissão para ler pacotes no GHCR.

## Fluxo automático

- merge em `main` publica imagem `ghcr.io/<owner>/jove-gateway:main`
- workflow `deploy` faz deploy automático em `staging`
- `production` fica protegido para disparo manual
- tags `vX.Y.Z` publicam imagens versionadas e `latest`

## Primeiro provisionamento

No servidor, dentro de `DEPLOY_PATH`:

```bash
mkdir -p /opt/jove
cd /opt/jove
# copiar docker-compose.release.yml
# criar .env manualmente
```

Login no GHCR:

```bash
docker login ghcr.io
```

Subida inicial:

```bash
export IMAGE_REPOSITORY=ghcr.io/<owner>/jove-gateway
export IMAGE_TAG=main
docker compose -f docker-compose.release.yml pull
docker compose -f docker-compose.release.yml up -d
```

## Estratégia recomendada

- `staging` acompanha `main`
- `production` usa tags `vX.Y.Z`
- faça promoção manual para produção após validar staging

## Observações

- mantenha firewall liberando apenas a porta necessária
- use secrets por ambiente no GitHub
- não armazene `.env` no repositório
- use branch protection antes de ativar auto deploy
