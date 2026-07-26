# Guia de configuração do Jove

## Onde colocar a API key

A autenticação do Azure usa **DefaultAzureCredential** — não é preciso informar
uma chave manualmente. O Azure encontra credenciais automaticamente via:

1. **Service Principal** — `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`
2. **Azure CLI** — `az login`
3. **Managed Identity** — em produção no Azure

### 1. Criar o arquivo de configuração

```bash
cp .env.example .env
```

### 2. Editar `.env`

```env
# Provider padrão
DEFAULT_PROVIDER=azure

# Azure AI Foundry
AZURE_AI_ENDPOINT=https://tino-resource.services.ai.azure.com/openai/v1
AZURE_AI_DEPLOYMENT_NAME=gpt-5.6-sol
AZURE_AI_DEFAULT_MODEL=gpt-5.6-sol
AZURE_AI_API_VERSION=2024-10-21

# Para autenticar com service principal (opcional):
# AZURE_TENANT_ID=
# AZURE_CLIENT_ID=
# AZURE_CLIENT_SECRET=
```

> ⚠️ **Nunca** commite o arquivo `.env`. Ele já está no `.gitignore`.

## Onde configurar os modelos

Os modelos são lidos das variáveis de ambiente:

- `AZURE_AI_DEPLOYMENT_NAME` → nome do deployment no Azure
- `AZURE_AI_DEFAULT_MODEL` → modelo padrão (usado se modelo não for especificado)
- `AZURE_AI_MODELS` → lista separada por vírgula (opcional)

```env
AZURE_AI_DEPLOYMENT_NAME=gpt-5.6-sol
AZURE_AI_DEFAULT_MODEL=gpt-5.6-sol
# AZURE_AI_MODELS=gpt-5.6-sol,gpt-4o,o3
```

## Estrutura do AzureFoundryProvider

O código do Azure AI Foundry fica em:

```
packages/providers/src/azure/foundry/
├── client.ts      → AzureFoundryClient (SDK OpenAI + DefaultAzureCredential)
├── provider.ts    → AzureFoundryProvider (implementa AIProvider)
└── index.ts       → exports
```

## Como o gateway resolve modelos

1. O gateway lê `.env` via `loadProvidersConfig()` em `packages/shared/src/config.ts`
2. `bootstrapRegistry()` cria o `AzureFoundryProvider` e registra no `ProviderRegistry`
3. Cada modelo é indexado (modelId → providerName)
4. Quando uma requisição chega, o registry resolve qual provedor atende

## Adicionar um novo provedor

1. Criar a classe em `packages/providers/src/novo-provider/`
2. Implementar a interface `AIProvider` de `@jove/core`
3. Adicionar a leitura de env em `packages/shared/src/config.ts`
4. Adicionar o case em `packages/providers/src/registry-bootstrap.ts`

## Endpoints atuais

| Método | Rota | Descrição | Status |
|--------|------|-----------|--------|
| GET | `/health` | Healthcheck | ✅ |
| GET | `/v1/models` | Lista modelos | ✅ |
| POST | `/v1/chat/completions` | Chat | ✅ (Passo 7) |
| POST | `/v1/responses` | Responses | ✅ (Passo 7) |
| POST | `/v1/embeddings` | Embeddings | ✅ (Passo 7) |
