# Plano mestre do projeto `jove`

## 1. Visão do projeto

Construir um gateway local compatível com a API da OpenAI, executado na raiz atual `jove/`, com os seguintes objetivos:

- receber requisições de clientes compatíveis com OpenAI API;
- encaminhar as chamadas para Azure AI Foundry ou outros provedores;
- permitir inclusão de novos provedores sem reescrever a arquitetura;
- rodar localmente no WSL/Linux desde o início;
- ficar pronto para empacotamento futuro em Docker e execução em Kubernetes.

## 2. Decisões técnicas oficiais

Para manter o plano consistente, o projeto adotará estas decisões como padrão:

- **Runtime:** Node.js 22 LTS
- **Linguagem:** TypeScript
- **Gerenciador de pacotes e workspace:** Bun
- **Framework HTTP:** Fastify
- **Validação de entrada/saída:** Zod
- **Logs:** Pino
- **Variáveis de ambiente:** dotenv
- **Testes:** Vitest
- **Lint:** ESLint
- **Formatação:** Prettier

> Observação: o rascunho anterior citava `bun` e `pnpm` ao mesmo tempo. O plano oficial deste projeto passa a usar apenas **Bun**.

## 3. Escopo funcional inicial

O MVP deve expor estes endpoints compatíveis com OpenAI:

- `GET /health`
- `GET /v1/models`
- `POST /v1/chat/completions`
- `POST /v1/responses`
- `POST /v1/embeddings`

Fora do MVP inicial, mas previstos na arquitetura:

- streaming de respostas;
- autenticação por múltiplas chaves;
- rate limiting;
- observabilidade avançada;
- painel administrativo web;
- cache e controle de custos.

## 4. Estrutura do repositório

A raiz do projeto será a pasta atual:

`/home/azureuser/jove`

Estrutura planejada:

```text
jove/
├── apps/
│   └── gateway/
├── packages/
│   ├── core/
│   ├── providers/
│   ├── openai-api/
│   └── shared/
├── configs/
├── docker/
├── scripts/
├── docs/
├── .env.example
├── .gitignore
├── package.json
├── bun.lock
├── tsconfig.base.json
└── README.md
```

### Responsabilidade de cada pasta

- `apps/gateway`: servidor HTTP principal.
- `packages/core`: interfaces centrais, casos de uso e contratos internos.
- `packages/providers`: implementações concretas dos provedores.
- `packages/openai-api`: schemas e contratos compatíveis com OpenAI API.
- `packages/shared`: utilitários, tipos genéricos, logger e helpers.
- `configs`: arquivos de configuração por ambiente.
- `docker`: Dockerfile e arquivos auxiliares de containerização.
- `scripts`: automações locais.
- `docs`: documentação técnica e decisões arquiteturais.

## 5. Princípios de arquitetura

### 5.1 Compatibilidade OpenAI na borda

Todo cliente externo falará apenas com a interface compatível com OpenAI. O cliente não conhecerá o provedor real.

### 5.2 Providers desacoplados

Cada provedor deverá implementar a mesma interface lógica. Exemplo conceitual:

```ts
export interface AIProvider {
  name: string;
  models(): Promise<ProviderModel[]>;
  chat(input: ChatCompletionRequest): Promise<ChatCompletionResponse>;
  responses(input: ResponseRequest): Promise<ResponseResponse>;
  embeddings(input: EmbeddingRequest): Promise<EmbeddingResponse>;
}
```

Provedores previstos:

- `AzureProvider`
- `OpenAIProvider`
- `AnthropicProvider`
- `GeminiProvider`
- `GroqProvider`
- `OllamaProvider`
- `OpenRouterProvider`

### 5.3 Configuração orientada a ambiente

Nada ficará fixo em código. Ativação de provedores, endpoints, chaves e modelos serão lidos de ambiente e, no futuro, de arquivos de configuração estruturados.

Exemplo conceitual:

```yaml
providers:
  azure:
    enabled: true
    endpoint: https://example.services.ai.azure.com
    apiKeyEnv: AZURE_AI_API_KEY

  openai:
    enabled: false
```

### 5.4 Registro central de modelos

`GET /v1/models` retornará a união dos modelos disponíveis nos provedores habilitados, já normalizados em um formato comum.

Exemplo:

```json
[
  { "id": "gpt-5.5", "provider": "azure" },
  { "id": "o3", "provider": "azure" },
  { "id": "claude-sonnet", "provider": "anthropic" }
]
```

### 5.5 Extensibilidade primeiro

A entrada de um novo provedor deve exigir apenas:

1. criar a classe do provedor;
2. implementar a interface padrão;
3. registrar o provedor no registry;
4. configurar ambiente e modelos.

## 6. Fluxo interno da aplicação

Fluxo esperado para uma requisição:

1. cliente envia requisição para endpoint compatível OpenAI;
2. Fastify recebe e valida com Zod;
3. gateway identifica modelo solicitado;
4. registry resolve qual provedor atende esse modelo;
5. provider adapter transforma a chamada para o formato do provedor real;
6. provedor responde;
7. gateway normaliza a resposta no formato OpenAI compatível;
8. resposta é devolvida ao cliente com logging estruturado.

## 7. Estratégia de implementação por fases

## Fase 1 — Fundação do monorepo

Objetivo:

- inicializar Git;
- criar `package.json` raiz;
- configurar Bun workspaces;
- criar a estrutura de pastas;
- criar `tsconfig.base.json`, ESLint, Prettier e `.gitignore`.

Entrega esperada:

- repositório pronto para desenvolvimento;
- comandos de build/test/lint definidos;
- estrutura vazia organizada.

## Fase 2 — Contratos e tipos centrais

Objetivo:

- criar `packages/core`;
- definir interfaces de provider;
- definir tipos de modelo, erro, config e roteamento;
- criar `packages/shared` para logger e utilitários.

Entrega esperada:

- base estável para todos os módulos seguintes.

## Fase 3 — Contratos OpenAI compatíveis

Objetivo:

- criar `packages/openai-api`;
- modelar schemas Zod para:
  - `chat/completions`;
  - `responses`;
  - `embeddings`;
  - `models`.

Entrega esperada:

- borda HTTP validada e tipada.

## Fase 4 — Gateway HTTP

Objetivo:

- criar `apps/gateway` com Fastify;
- adicionar `GET /health`;
- adicionar `GET /v1/models`;
- estruturar rotas, plugins e tratamento de erro.

Entrega esperada:

- servidor sobe localmente;
- healthcheck e listagem de modelos funcionam.

## Fase 5 — Registry e resolução de providers

Objetivo:

- criar registry de provedores;
- mapear modelo -> provedor;
- permitir fallback futuro.

Entrega esperada:

- resolução centralizada de roteamento.

## Fase 6 — Primeiro provider real: Azure AI Foundry

Objetivo:

- implementar `AzureProvider`;
- integrar autenticação por chave;
- listar modelos configurados;
- suportar pelo menos um fluxo real de inferência.

Entrega esperada:

- primeiro backend funcional do gateway.

## Fase 7 — Endpoints de inferência do MVP

Objetivo:

- implementar `POST /v1/chat/completions`;
- implementar `POST /v1/responses`;
- implementar `POST /v1/embeddings`.

Entrega esperada:

- cliente OpenAI-compatible consegue usar o gateway.

## Fase 8 — Observabilidade e robustez

Objetivo:

- logs estruturados com Pino;
- correlation/request id;
- tratamento padronizado de erros;
- timeout e retry por provider.

Entrega esperada:

- operação local confiável e depuração simples.

## Fase 9 — Testes

Objetivo:

- testes unitários para registry, adapters e validação;
- testes de integração para endpoints principais;
- mocks de providers.

Entrega esperada:

- confiança para evolução do projeto.

## Fase 10 — Empacotamento

Objetivo:

- criar Dockerfile;
- preparar variáveis de ambiente;
- documentar execução local e por container.

Entrega esperada:

- projeto pronto para uso local e futura publicação.

## 8. Ambiente local oficial

Como o ambiente já está em Linux/WSL, o setup oficial fica assim:

### Dependências de sistema

```bash
sudo apt update
sudo apt install -y build-essential git curl unzip
```

### Node.js 22 via nvm

```bash
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22
node -v
npm -v
```

### Bun

```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
bun --version
```

### Git

```bash
git config --global user.name "Kayro Gomes"
git config --global user.email "kayroalex@gmail.com"
```

## 9. Convenções do projeto

- linguagem principal: inglês em nomes de código;
- documentação: pode ser mantida em português;
- commit inicial pequeno e estruturante;
- um provider por módulo;
- nenhuma credencial no repositório;
- sempre expor exemplos em `.env.example`;
- todos os contratos HTTP validados com Zod.

## 10. Variáveis de ambiente previstas

Exemplo inicial de `.env.example`:

```env
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

DEFAULT_PROVIDER=azure

AZURE_AI_ENDPOINT=
AZURE_AI_API_KEY=
AZURE_AI_API_VERSION=
AZURE_AI_DEFAULT_MODEL=
```

No futuro poderão ser adicionadas:

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`
- `GROQ_API_KEY`
- `OLLAMA_BASE_URL`
- `OPENROUTER_API_KEY`

## 11. Critério de pronto do MVP

O MVP será considerado pronto quando:

- o gateway subir com `bun run dev`;
- `GET /health` responder corretamente;
- `GET /v1/models` listar modelos do provider habilitado;
- `POST /v1/chat/completions` funcionar com Azure;
- `POST /v1/responses` funcionar ou possuir adaptação consistente;
- `POST /v1/embeddings` funcionar;
- existir `.env.example`;
- existir documentação mínima de execução.

## 12. Roadmap pós-MVP

Depois do MVP, a evolução recomendada é:

1. streaming SSE;
2. autenticação para clientes externos;
3. cache de respostas;
4. métricas e tracing;
5. painel administrativo web;
6. múltiplos provedores simultâneos;
7. fallback e balanceamento por custo/latência;
8. deploy via Docker e Kubernetes.

## 13. Próxima ação objetiva

O **primeiro passo prático** de implementação será:

1. inicializar o monorepo na raiz `jove`;
2. criar a estrutura de diretórios oficial;
3. criar o `package.json` raiz com Bun workspaces;
4. criar configurações base de TypeScript, ESLint e Prettier;
5. preparar `.gitignore` e `.env.example`.

Esse é o ponto de partida oficial do projeto.