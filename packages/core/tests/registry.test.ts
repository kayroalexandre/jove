import { describe, expect, it } from 'vitest';
import {
  ProviderRegistry,
  ModelNotFoundError,
  ProviderNotFoundError,
  ProviderConfigError,
  type AIProvider,
  type ChatCompletionRequest,
  type ChatCompletionResponse,
  type EmbeddingRequest,
  type EmbeddingResponse,
  type ProviderModel,
  type ResponseRequest,
  type ResponseResponse,
} from '../src/index';

function createMockProvider(name: string, modelIds: string[] = []): AIProvider {
  return {
    name,
    async models(): Promise<ProviderModel[]> {
      return modelIds.map((id) => ({ id, provider: name, object: 'model' }));
    },
    async chat(_input: ChatCompletionRequest): Promise<ChatCompletionResponse> {
      return {
        id: 'chat-1',
        object: 'chat.completion',
        created: Date.now(),
        model: _input.model,
        choices: [
          { index: 0, message: { role: 'assistant', content: 'mock' }, finishReason: 'stop' },
        ],
      };
    },
    async responses(_input: ResponseRequest): Promise<ResponseResponse> {
      return { id: 'resp-1', model: _input.model, output: 'mock' };
    },
    async embeddings(_input: EmbeddingRequest): Promise<EmbeddingResponse> {
      return {
        model: _input.model,
        data: [{ object: 'embedding', index: 0, embedding: [0.1, 0.2] }],
      };
    },
  };
}

describe('ProviderRegistry', () => {
  it('registers and retrieves a provider', () => {
    const registry = new ProviderRegistry();
    const provider = createMockProvider('azure', ['gpt-4o']);
    registry.register(provider);

    expect(registry.get('azure')).toBe(provider);
    expect(registry.list()).toHaveLength(1);
  });

  it('throws on duplicate registration', () => {
    const registry = new ProviderRegistry();
    registry.register(createMockProvider('azure'));

    expect(() => registry.register(createMockProvider('azure'))).toThrow(ProviderConfigError);
  });

  it('throws on unknown provider get', () => {
    const registry = new ProviderRegistry();

    expect(() => registry.get('nonexistent')).toThrow(ProviderNotFoundError);
  });

  it('resolves model to registered provider', () => {
    const registry = new ProviderRegistry();
    const azure = createMockProvider('azure', ['gpt-4o']);
    registry.register(azure);
    registry.registerModel('gpt-4o', 'azure');

    expect(registry.resolve('gpt-4o')).toBe(azure);
  });

  it('falls back to default provider when model not indexed', () => {
    const registry = new ProviderRegistry();
    const azure = createMockProvider('azure');
    registry.register(azure);

    expect(registry.resolve('unknown-model', 'azure')).toBe(azure);
  });

  it('throws ModelNotFoundError when model and default are not found', () => {
    const registry = new ProviderRegistry();

    expect(() => registry.resolve('unknown-model')).toThrow(ModelNotFoundError);
  });

  it('lists all models from all providers', async () => {
    const registry = new ProviderRegistry();
    registry.register(createMockProvider('azure', ['gpt-4o', 'o3']));
    registry.register(createMockProvider('openai', ['gpt-4']));

    const models = await registry.listModels();
    expect(models).toHaveLength(3);
    expect(models.map((m) => m.id)).toContain('gpt-4o');
    expect(models.map((m) => m.id)).toContain('o3');
    expect(models.map((m) => m.id)).toContain('gpt-4');
  });
});
