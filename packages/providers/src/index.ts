import type {
  AIProvider,
  ChatCompletionRequest,
  ChatCompletionResponse,
  EmbeddingRequest,
  EmbeddingResponse,
  ProviderModel,
  ResponseRequest,
  ResponseResponse,
} from '@jove/core';
import { logger } from '@jove/shared';
import { bootstrapRegistry } from './registry-bootstrap';

export { AzureProvider, createAzureProvider } from './azure';
export {
  AzureFoundryClient,
  AzureFoundryProvider,
  createAzureFoundryProvider,
} from './azure/foundry';
export { bootstrapRegistry };

/**
 * Stub de provedor — placeholder para testes e desenvolvimento.
 */
export class StubProvider implements AIProvider {
  readonly name = 'stub';

  async models(): Promise<ProviderModel[]> {
    return [{ id: 'stub-model', provider: this.name }];
  }

  async chat(_input: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    logger.warn({ provider: this.name }, 'chat called on stub provider');
    throw new Error(`Provider '${this.name}' is not implemented yet`);
  }

  async responses(_input: ResponseRequest): Promise<ResponseResponse> {
    logger.warn({ provider: this.name }, 'responses called on stub provider');
    throw new Error(`Provider '${this.name}' is not implemented yet`);
  }

  async embeddings(_input: EmbeddingRequest): Promise<EmbeddingResponse> {
    logger.warn({ provider: this.name }, 'embeddings called on stub provider');
    throw new Error(`Provider '${this.name}' is not implemented yet`);
  }
}
