import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import {
  ProviderRegistry,
  type AIProvider,
  type ChatCompletionRequest,
  type ChatCompletionResponse,
  type EmbeddingRequest,
  type EmbeddingResponse,
  type ProviderModel,
  type ResponseRequest,
  type ResponseResponse,
} from '@jove/core';
import { registerApiRoutes } from '../src/routes';

// Mock provider para testes de integração
const mockProvider: AIProvider = {
  name: 'mock',
  async models(): Promise<ProviderModel[]> {
    return [{ id: 'mock-model', provider: 'mock', object: 'model' }];
  },
  async chat(input: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    return {
      id: 'chat-test',
      object: 'chat.completion',
      created: 1234567890,
      model: input.model,
      choices: [
        {
          index: 0,
          message: { role: 'assistant', content: 'mock response' },
          finishReason: 'stop',
        },
      ],
    };
  },
  async responses(input: ResponseRequest): Promise<ResponseResponse> {
    return { id: 'resp-test', model: input.model, output: 'mock output' };
  },
  async embeddings(input: EmbeddingRequest): Promise<EmbeddingResponse> {
    return {
      model: input.model,
      data: [{ object: 'embedding', index: 0, embedding: [0.1, 0.2] }],
    };
  },
};

async function buildApp(): Promise<FastifyInstance> {
  const Fastify = (await import('fastify')).default;
  const app = Fastify({ logger: false });

  const registry = new ProviderRegistry();
  registry.register(mockProvider);
  registry.registerModel('mock-model', 'mock');

  registerApiRoutes(app, registry, 'mock');
  return app;
}

describe('Gateway API routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /v1/chat/completions — success', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/chat/completions',
      payload: {
        model: 'mock-model',
        messages: [{ role: 'user', content: 'hello' }],
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.object).toBe('chat.completion');
    expect(body.choices).toHaveLength(1);
    expect(body.choices[0].message.content).toBe('mock response');
  });

  it('POST /v1/chat/completions — invalid body', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/chat/completions',
      payload: { model: 'x' },
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.error.type).toBe('invalid_request_error');
  });

  it('POST /v1/responses — success', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/responses',
      payload: { model: 'mock-model', input: 'hello' },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.id).toBe('resp-test');
  });

  it('POST /v1/responses — invalid body', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/responses',
      payload: {},
    });

    expect(res.statusCode).toBe(400);
  });

  it('POST /v1/embeddings — success', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/embeddings',
      payload: { model: 'mock-model', input: 'hello' },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.data).toHaveLength(1);
  });

  it('POST /v1/embeddings — invalid body', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/embeddings',
      payload: { model: 'x' },
    });

    expect(res.statusCode).toBe(400);
  });
});
