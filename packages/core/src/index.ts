/**
 * Contratos centrais do gateway.
 *
 * Toda implementação de provedor deve satisfazer a interface {@link AIProvider}.
 */

export interface ProviderModel {
  id: string;
  provider: string;
  object?: string;
  created?: number;
  ownedBy?: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
}

export interface ChatCompletionResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: ChatChoice[];
}

export interface ChatChoice {
  index: number;
  message: ChatMessage;
  finishReason: string;
}

export interface ResponseRequest {
  model: string;
  input: string | ChatMessage[];
}

export interface ResponseResponse {
  id: string;
  model: string;
  output: unknown;
}

export interface EmbeddingRequest {
  model: string;
  input: string | string[];
}

export interface EmbeddingResponse {
  model: string;
  data: EmbeddingItem[];
}

export interface EmbeddingItem {
  object: 'embedding';
  index: number;
  embedding: number[];
}

/**
 * Interface que todo provedor deve implementar.
 */
export interface AIProvider {
  readonly name: string;
  models(): Promise<ProviderModel[]>;
  chat(input: ChatCompletionRequest): Promise<ChatCompletionResponse>;
  responses(input: ResponseRequest): Promise<ResponseResponse>;
  embeddings(input: EmbeddingRequest): Promise<EmbeddingResponse>;
}

// ── Configuração ──────────────────────────────────────────────

export interface ProviderConfig {
  enabled: boolean;
  endpoint?: string;
  apiKeyEnv?: string;
  apiKey?: string;
  apiVersion?: string;
  defaultModel?: string;
  models?: string[];
}

export type ProvidersConfig = Record<string, ProviderConfig>;

// ── Erros ─────────────────────────────────────────────────────

export class GatewayError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'GatewayError';
  }
}

export class ProviderNotFoundError extends GatewayError {
  constructor(provider: string) {
    super(`Provider '${provider}' not found`, 'provider_not_found', 404);
    this.name = 'ProviderNotFoundError';
  }
}

export class ModelNotFoundError extends GatewayError {
  constructor(model: string) {
    super(`Model '${model}' not found in any enabled provider`, 'model_not_found', 404);
    this.name = 'ModelNotFoundError';
  }
}

export class ProviderConfigError extends GatewayError {
  constructor(message: string, provider?: string) {
    super(message, 'provider_config_error', 400, { provider });
    this.name = 'ProviderConfigError';
  }
}

// ── Registry ──────────────────────────────────────────────────

/**
 * Registry central de provedores.
 *
 * Responsável por:
 * - registrar provedores habilitados;
 * - mapear modelo -> provedor;
 * - listar todos os modelos disponíveis;
 * - resolver qual provedor atende um modelo.
 */
export class ProviderRegistry {
  private readonly providers = new Map<string, AIProvider>();
  private readonly modelIndex = new Map<string, string>(); // modelId -> providerName

  register(provider: AIProvider): void {
    if (this.providers.has(provider.name)) {
      throw new ProviderConfigError(
        `Provider '${provider.name}' already registered`,
        provider.name,
      );
    }
    this.providers.set(provider.name, provider);
  }

  get(name: string): AIProvider {
    const provider = this.providers.get(name);
    if (!provider) throw new ProviderNotFoundError(name);
    return provider;
  }

  list(): AIProvider[] {
    return [...this.providers.values()];
  }

  /**
   * Indexa um modelo no registry, mapeando modelId -> providerName.
   */
  registerModel(modelId: string, providerName: string): void {
    this.modelIndex.set(modelId, providerName);
  }

  /**
   * Resolve qual provedor atende um determinado modelo.
   * Se o modelo não estiver indexado, tenta o provider padrão.
   */
  resolve(modelId: string, defaultProvider?: string): AIProvider {
    const providerName = this.modelIndex.get(modelId);
    if (providerName) return this.get(providerName);

    if (defaultProvider) {
      const provider = this.providers.get(defaultProvider);
      if (provider) return provider;
    }

    throw new ModelNotFoundError(modelId);
  }

  /**
   * Retorna todos os modelos disponíveis de todos os provedores habilitados.
   */
  async listModels(): Promise<ProviderModel[]> {
    const all: ProviderModel[] = [];
    for (const provider of this.providers.values()) {
      const models = await provider.models();
      all.push(...models);
    }
    return all;
  }
}
