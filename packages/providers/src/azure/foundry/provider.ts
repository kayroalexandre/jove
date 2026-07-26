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
import type {
  ChatCompletionMessageParam,
} from 'openai/resources';
import { logger } from '@jove/shared';
import { AzureFoundryClient } from './client';

export interface AzureFoundryProviderOptions {
  endpoint: string;
  deploymentName: string;
  apiKey: string;
  models?: string[];
}

/**
 * Provider para Azure AI Foundry.
 *
 * Implementa a interface AIProvider usando o SDK OpenAI
 * com API key direta para autenticação.
 *
 * Estrutura:
 * - AzureFoundryClient: encapsula a conexão com o Azure
 * - AzureFoundryProvider: implementa a interface AIProvider
 *   traduzindo chamadas do gateway para o SDK OpenAI
 */
export class AzureFoundryProvider implements AIProvider {
  readonly name = 'azure';
  private readonly client: AzureFoundryClient;
  private readonly modelList: string[];

  constructor(opts: AzureFoundryProviderOptions) {
    this.client = new AzureFoundryClient({
      endpoint: opts.endpoint,
      deploymentName: opts.deploymentName,
      apiKey: opts.apiKey,
    });
    this.modelList = opts.models ?? [opts.deploymentName];
  }

  async models(): Promise<ProviderModel[]> {
    return this.modelList.map((id) => ({
      id,
      provider: this.name,
      object: 'model',
      ownedBy: 'azure-foundry',
    }));
  }

  async chat(input: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    logger.info(
      { provider: this.name, model: input.model, messages: input.messages.length },
      'chat: calling Azure AI Foundry',
    );

    const completion = await this.client.client.chat.completions.create({
      model: input.model,
      messages: input.messages.map(
        (m) =>
          ({ role: m.role, content: m.content }) as ChatCompletionMessageParam,
      ),
      temperature: input.temperature,
      max_tokens: input.maxTokens,
    });

    return {
      id: completion.id,
      object: 'chat.completion',
      created: completion.created,
      model: completion.model,
      choices: completion.choices.map((choice) => ({
        index: choice.index,
        message: {
          role: choice.message.role as 'system' | 'user' | 'assistant' | 'tool',
          content: choice.message.content ?? '',
        },
        finishReason: choice.finish_reason ?? 'stop',
      })),
    };
  }

  async responses(input: ResponseRequest): Promise<ResponseResponse> {
    logger.info(
      { provider: this.name, model: input.model },
      'responses: calling Azure AI Foundry',
    );

    // Converte input para o formato esperado pelo SDK
    const inputText =
      typeof input.input === 'string'
        ? input.input
        : (input.input.map((m) => ({ role: m.role, content: m.content })) as unknown as string);

    const response = await this.client.client.responses.create({
      model: input.model,
      input: inputText,
    });

    return {
      id: response.id,
      model: response.model,
      output: response.output,
    };
  }

  async embeddings(input: EmbeddingRequest): Promise<EmbeddingResponse> {
    logger.info(
      { provider: this.name, model: input.model },
      'embeddings: calling Azure AI Foundry',
    );

    const embeddingInput =
      typeof input.input === 'string' ? input.input : input.input;

    const result = await this.client.client.embeddings.create({
      model: input.model,
      input: embeddingInput,
    });

    return {
      model: result.model,
      data: result.data.map((item) => ({
        object: 'embedding',
        index: item.index,
        embedding: item.embedding,
      })),
    };
  }
}

/**
 * Cria um AzureFoundryProvider a partir de uma ProviderConfig.
 */
export function createAzureFoundryProvider(config: ProviderConfig): AzureFoundryProvider {
  if (!config.endpoint) {
    throw new Error('AzureFoundryProvider requires endpoint in configuration');
  }

  if (!config.apiKey) {
    throw new Error('AzureFoundryProvider requires apiKey in configuration');
  }

  // O deploymentName pode vir de defaultModel ou do primeiro modelo da lista
  const deploymentName = config.defaultModel ?? config.models?.[0];
  if (!deploymentName) {
    throw new Error(
      'AzureFoundryProvider requires defaultModel or at least one model in configuration',
    );
  }

  return new AzureFoundryProvider({
    endpoint: config.endpoint,
    deploymentName,
    apiKey: config.apiKey,
    models: config.models,
  });
}
