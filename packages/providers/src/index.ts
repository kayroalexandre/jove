import type { AIProvider, ChatCompletionRequest, ChatCompletionResponse, EmbeddingRequest, EmbeddingResponse, ProviderModel, ResponseRequest, ResponseResponse } from '@jove/core';
import { logger } from '@jove/shared';

/**
 * Stub de provedor — será substituído por implementações reais (Azure, OpenAI, etc.).
 * Apenas mantém o registry funcional desde o Passo 1.
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
