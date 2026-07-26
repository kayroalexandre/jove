# Execução com Docker

## Pré-requisitos

- Docker 24+
- Docker Compose v2

## 1. Configurar ambiente

Na raiz do projeto:

```bash
cp .env.example .env
```

Preencha no `.env`:

```env
AZURE_AI_ENDPOINT=https://tino-resource.services.ai.azure.com/openai/v1
AZURE_AI_API_KEY=sua-chave-aqui
AZURE_AI_DEPLOYMENT_NAME=gpt-5.6-sol
AZURE_AI_DEFAULT_MODEL=gpt-5.6-sol
```

Nunca adicione `.env` ao Git.

## 2. Executar com Docker Compose

```bash
docker compose up --build -d
```

Ver logs:

```bash
docker compose logs -f gateway
```

Ver status e healthcheck:

```bash
docker compose ps
```

Parar:

```bash
docker compose down
```

## 3. Executar sem Docker Compose

Build:

```bash
docker build -t jove-gateway:local .
```

Run:

```bash
docker run --rm \
  --name jove-gateway \
  --env-file .env \
  -p 3000:3000 \
  jove-gateway:local
```

## 4. Validar

```bash
curl http://localhost:3000/health
curl http://localhost:3000/v1/models
```

Exemplo de resposta do healthcheck:

```json
{
  "status": "ok",
  "timestamp": 1234567890
}
```

## Segurança

- A imagem executa com usuário não-root `bun`.
- O Compose habilita `no-new-privileges`.
- O arquivo `.env` não entra na imagem por causa de `.dockerignore`.
- O `HEALTHCHECK` usa `fetch` nativo do Bun, sem instalar ferramentas extras.
