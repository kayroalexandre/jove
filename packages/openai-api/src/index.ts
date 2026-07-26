import { z } from 'zod';

/**
 * Schemas compatíveis com a API da OpenAI.
 * Usados para validar requisições recebidas pelo gateway.
 */

export const chatMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant', 'tool']),
  content: z.string(),
});

export const chatCompletionRequestSchema = z.object({
  model: z.string(),
  messages: z.array(chatMessageSchema).min(1),
  temperature: z.number().optional(),
  maxTokens: z.number().optional(),
  stream: z.boolean().optional(),
});

export const modelsListResponseSchema = z.array(
  z.object({
    id: z.string(),
    object: z.string().optional(),
    created: z.number().optional(),
    ownedBy: z.string().optional(),
  }),
);

export const responseRequestSchema = z.object({
  model: z.string(),
  input: z.union([z.string(), z.array(chatMessageSchema)]),
});

export const embeddingRequestSchema = z.object({
  model: z.string(),
  input: z.union([z.string(), z.array(z.string())]),
});

export type ChatCompletionRequest = z.infer<typeof chatCompletionRequestSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ResponseRequest = z.infer<typeof responseRequestSchema>;
export type EmbeddingRequest = z.infer<typeof embeddingRequestSchema>;
