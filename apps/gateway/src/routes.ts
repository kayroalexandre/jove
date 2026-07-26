import type { FastifyInstance } from 'fastify';
import {
  GatewayError,
  type ProviderRegistry,
} from '@jove/core';
import {
  chatCompletionRequestSchema,
  embeddingRequestSchema,
  responseRequestSchema,
} from '@jove/openai-api';
import { logger } from '@jove/shared';

/**
 * Registra as rotas POST do MVP no gateway.
 *
 * Endpoints:
 * - POST /v1/chat/completions
 * - POST /v1/responses
 * - POST /v1/embeddings
 */
export function registerApiRoutes(
  app: FastifyInstance,
  registry: ProviderRegistry,
  defaultProvider?: string,
): void {
  // ── POST /v1/chat/completions ──────────────────────────────
  app.post('/v1/chat/completions', async (request, reply) => {
    const parsed = chatCompletionRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: {
          message: 'Invalid request body',
          type: 'invalid_request_error',
          details: parsed.error.issues,
        },
      });
    }

    const body = parsed.data;
    logger.info(
      { model: body.model, messages: body.messages.length, stream: body.stream },
      'chat/completions: request received',
    );

    try {
      const provider = registry.resolve(body.model, defaultProvider);
      const result = await provider.chat({
        model: body.model,
        messages: body.messages,
        temperature: body.temperature,
        maxTokens: body.maxTokens,
        stream: body.stream,
      });

      return reply.send(result);
    } catch (err) {
      return handleError(err, reply);
    }
  });

  // ── POST /v1/responses ──────────────────────────────────────
  app.post('/v1/responses', async (request, reply) => {
    const parsed = responseRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: {
          message: 'Invalid request body',
          type: 'invalid_request_error',
          details: parsed.error.issues,
        },
      });
    }

    const body = parsed.data;
    logger.info({ model: body.model }, 'responses: request received');

    try {
      const provider = registry.resolve(body.model, defaultProvider);
      const result = await provider.responses({
        model: body.model,
        input: body.input,
      });

      return reply.send(result);
    } catch (err) {
      return handleError(err, reply);
    }
  });

  // ── POST /v1/embeddings ─────────────────────────────────────
  app.post('/v1/embeddings', async (request, reply) => {
    const parsed = embeddingRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: {
          message: 'Invalid request body',
          type: 'invalid_request_error',
          details: parsed.error.issues,
        },
      });
    }

    const body = parsed.data;
    logger.info({ model: body.model }, 'embeddings: request received');

    try {
      const provider = registry.resolve(body.model, defaultProvider);
      const result = await provider.embeddings({
        model: body.model,
        input: body.input,
      });

      return reply.send(result);
    } catch (err) {
      return handleError(err, reply);
    }
  });
}

/**
 * Tratamento centralizado de erros.
 */
function handleError(err: unknown, reply: ReturnType<import('fastify').FastifyReply['status']>): void {
  if (err instanceof GatewayError) {
    reply.status(err.statusCode).send({
      error: {
        message: err.message,
        type: err.code,
        details: err.details,
      },
    });
    return;
  }

  logger.error({ err }, 'Unhandled error in route');
  reply.status(500).send({
    error: {
      message: 'Internal server error',
      type: 'internal_error',
    },
  });
}
