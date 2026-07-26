# Guia de configuração do Jove

## Onde colocar a API key

Toda configuração de credenciais fica no arquivo `.env` na raiz do projeto.

### 1. Criar o arquivo

```bash
cp .env.example .env
```

### 2. Editar `.env`

Preencha as variáveis do provedor que deseja habilitar:

```env
# Provider padrão
DEFAULT_PROVIDER=azure

# Azure AI Foundry
AZURE_AI_ENDPOINT=https://SEU-RESOURCE.services.ai.azure.com
AZURE_AI_API_KEY=sua-chave-aqui
AZURE_AI_API_VERSION=2024-10-21
AZURE_AI_DEFAULT_MODEL=gpt-4o
```

> ⚠️ **Nunca** commite o arquivo `.env`. Ele já está no `.gitignore`.

## Onde colocar a lista de modelos

Os modelos são descobertos automaticamente a partir das variáveis de ambiente:

- `AZURE_AI_DEFAULT_MODEL` define o modelo padrão do Azure.
- No futuro, `AZURE_AI_MODELS` permitirá listar múltiplos modelos separados por vírgula.

Exemplo:

```env
AZURE_AI_DEFAULT_MODEL=gpt-4o
# Futuro: AZURE_AI_MODELS=gpt-4o,gpt-4o-mini,o3
```

## Como o gateway resolve modelos

1. O gateway lê `.env` e registra provedores habilitados no `ProviderRegistry`.
2. Cada modelo é indexado no registry (modelId → providerName).
3. Quando uma requisição chega, o registry resolve qual provedor atende o modelo.
4. Se o modelo não estiver mapeado, usa o `DEFAULT_PROVIDER`.

## Arquitetura do registry

```
.env → loadProvidersConfig() → ProviderRegistry
                                    ↓
                          register(provider)
                          registerModel(id, providerName)
                                    ↓
                          resolve(modelId) → AIProvider
```

## Adicionar um novo provedor no futuro

1. Criar a classe em `packages/providers/src/novo-provider.ts`
2. Implementar a interface `AIProvider` de `@jove/core`
3. Adicionar a leitura de env em `packages/shared/src/config.ts`
4. Adicionar o case em `packages/providers/src/registry-bootstrap.ts`

## Endpoints atuais

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/health` | Healthcheck do gateway |
| GET | `/v1/models` | Lista modelos disponíveis |
| POST | `/v1/chat/completions` | _(Passo 7)_ |
| POST | `/v1/responses` | _(Passo 7)_ |
| POST | `/v1/embeddings` | _(Passo 7)_ |
