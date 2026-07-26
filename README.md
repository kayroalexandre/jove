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
- `POST /v1/chat/completions` — _(em breve)_
- `POST /v1/responses` — _(em breve)_
- `POST /v1/embeddings` — _(em breve)_

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
