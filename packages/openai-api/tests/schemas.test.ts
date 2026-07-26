import { describe, expect, it } from 'vitest';
import {
  chatCompletionRequestSchema,
  embeddingRequestSchema,
  responseRequestSchema,
} from '../src/index';

describe('chatCompletionRequestSchema', () => {
  it('validates a valid chat request', () => {
    const result = chatCompletionRequestSchema.safeParse({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'hello' }],
    });

    expect(result.success).toBe(true);
  });

  it('validates with optional fields', () => {
    const result = chatCompletionRequestSchema.safeParse({
      model: 'gpt-4o',
      messages: [{ role: 'system', content: 'you are helpful' }],
      temperature: 0.7,
      maxTokens: 100,
      stream: true,
    });

    expect(result.success).toBe(true);
  });

  it('rejects empty messages array', () => {
    const result = chatCompletionRequestSchema.safeParse({
      model: 'gpt-4o',
      messages: [],
    });

    expect(result.success).toBe(false);
  });

  it('rejects missing model', () => {
    const result = chatCompletionRequestSchema.safeParse({
      messages: [{ role: 'user', content: 'hello' }],
    });

    expect(result.success).toBe(false);
  });

  it('rejects invalid role', () => {
    const result = chatCompletionRequestSchema.safeParse({
      model: 'gpt-4o',
      messages: [{ role: 'admin', content: 'hello' }],
    });

    expect(result.success).toBe(false);
  });
});

describe('responseRequestSchema', () => {
  it('validates with string input', () => {
    const result = responseRequestSchema.safeParse({
      model: 'gpt-4o',
      input: 'hello',
    });

    expect(result.success).toBe(true);
  });

  it('validates with array input', () => {
    const result = responseRequestSchema.safeParse({
      model: 'gpt-4o',
      input: [{ role: 'user', content: 'hello' }],
    });

    expect(result.success).toBe(true);
  });

  it('rejects missing model', () => {
    const result = responseRequestSchema.safeParse({
      input: 'hello',
    });

    expect(result.success).toBe(false);
  });
});

describe('embeddingRequestSchema', () => {
  it('validates with string input', () => {
    const result = embeddingRequestSchema.safeParse({
      model: 'text-embedding-3',
      input: 'hello',
    });

    expect(result.success).toBe(true);
  });

  it('validates with array input', () => {
    const result = embeddingRequestSchema.safeParse({
      model: 'text-embedding-3',
      input: ['hello', 'world'],
    });

    expect(result.success).toBe(true);
  });

  it('rejects missing input', () => {
    const result = embeddingRequestSchema.safeParse({
      model: 'text-embedding-3',
    });

    expect(result.success).toBe(false);
  });
});
