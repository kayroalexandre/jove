# Jove — AI Gateway

Gateway local compatível com a API da OpenAI, com suporte a Azure AI Foundry e outros provedores.

## Requisitos

- Node.js 22 LTS
- Bun 1.3+

## Setup

```bash
cp .env.example .env
bun install
bun run dev
```

## Endpoints do MVP

- `GET /health` — healthcheck
- `GET /v1/models` — lista modelos disponíveis
- `POST /v1/chat/completions` — chat compatível com OpenAI
- `POST /v1/responses` — Responses API compatível
- `POST /v1/embeddings` — geração de embeddings

## Docker

Após configurar o arquivo `.env`:

```bash
docker compose up --build -d
```

Consulte `docs/docker.md` para instruções completas.

## Estrutura

```
apps/gateway       — servidor HTTP
packages/core     — interfaces centrais
packages/providers — implementações de provedores
packages/openai-api — schemas compatíveis com OpenAI
packages/shared    — utilitários e logger
```

## Ambiente

Veja `.env.example` para todas as variáveis suportadas.

## Validação

```bash
bun run validate
```

## Pipeline de engenharia

O projeto agora inclui base profissional para:

- desenvolvimento com validação local
- hooks de Git para pre-commit e commit-msg
- prevenção de regressão com CI
- publicação de imagem no GHCR
- versionamento com Changesets
- deploy contínuo para `staging` e promoção manual para `production`

Consulte `docs/engineering-pipeline.md`, `docs/branch-protection.md` e `docs/server-deploy.md`.
