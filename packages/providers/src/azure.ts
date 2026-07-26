import type {
  AIProvider,
  ChatCompletionRequest,
  ChatCompletionResponse,
  EmbeddingRequest,
  EmbeddingResponse,
  ProviderConfig,
  ProviderModel,
  ResponseRequest,
  ResponseResponse,
} from '@jove/core';
import { logger } from '@jove/shared';

export interface AzureProviderOptions {
  endpoint: string;
  apiKey: string;
  apiVersion?: string;
  defaultModel?: string;
  models?: string[];
}

/**
 * Provider para Azure AI Foundry.
 *
 * Implementa a interface AIProvider e encaminha chamadas
 * para a API do Azure OpenAI / AI Foundry.
 *
 * No Passo 2, a estrutura está pronta mas a integração HTTP real
 * será completada no Passo 6.
 */
export class AzureProvider implements AIProvider {
  readonly name = 'azure';
  private readonly endpoint: string;
  private readonly apiKey: string;
  private readonly apiVersion: string;
  private readonly defaultModel?: string;
  private readonly modelList: string[];

  constructor(opts: AzureProviderOptions) {
    this.endpoint = opts.endpoint.replace(/\/$/, '');
    this.apiKey = opts.apiKey;
    this.apiVersion = opts.apiVersion ?? '2024-10-21';
    this.defaultModel = opts.defaultModel;
    this.modelList = opts.models ?? [];
  }

  /**
   * Lista os modelos configurados para este provedor.
   * Se nenhum modelo for configurado manualmente, retorna o defaultModel.
   */
  async models(): Promise<ProviderModel[]> {
    if (this.modelList.length > 0) {
      return this.modelList.map((id) => ({
        id,
        provider: this.name,
        object: 'model',
      }));
    }

    if (this.defaultModel) {
      return [
        {
          id: this.defaultModel,
          provider: this.name,
          object: 'model',
        },
      ];
    }

    return [];
  }

  async chat(input: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    logger.info(
      { provider: this.name, model: input.model },
      'chat: delegating to Azure (not yet implemented)',
    );
    throw new Error(
      `AzureProvider.chat() will be implemented in Step 6. Model: ${input.model}`,
    );
  }

  async responses(input: ResponseRequest): Promise<ResponseResponse> {
    logger.info(
      { provider: this.name, model: input.model },
      'responses: delegating to Azure (not yet implemented)',
    );
    throw new Error(
      `AzureProvider.responses() will be implemented in Step 6. Model: ${input.model}`,
    );
  }

  async embeddings(input: EmbeddingRequest): Promise<EmbeddingResponse> {
    logger.info(
      { provider: this.name, model: input.model },
      'embeddings: delegating to Azure (not yet implemented)',
    );
    throw new Error(
      `AzureProvider.embeddings() will be implemented in Step 6. Model: ${input.model}`,
    );
  }
}

/**
 * Cria um AzureProvider a partir de uma ProviderConfig.
 */
export function createAzureProvider(config: ProviderConfig): AzureProvider {
  if (!config.endpoint || !config.apiKey) {
    throw new Error(
      'AzureProvider requires endpoint and apiKey in configuration',
    );
  }

  return new AzureProvider({
    endpoint: config.endpoint,
    apiKey: config.apiKey,
    apiVersion: config.apiVersion,
    defaultModel: config.defaultModel,
    models: config.models,
  });
}
