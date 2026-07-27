import type { FastifyInstance, FastifyReply } from 'fastify';
import { GatewayError, type ProviderRegistry } from '@jove/core';
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
    const requestId = request.id;
    const parsed = chatCompletionRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: {
          message: 'Invalid request body',
          type: 'invalid_request_error',
          requestId,
          details: parsed.error.issues,
        },
      });
    }

    const body = parsed.data;
    logger.info(
      { requestId, model: body.model, messages: body.messages.length, stream: body.stream },
      'chat/completions: request received',
    );

    const startTime = Date.now();
    try {
      const provider = registry.resolve(body.model, defaultProvider);
      const result = await provider.chat({
        model: body.model,
        messages: body.messages,
        temperature: body.temperature,
        maxTokens: body.maxTokens,
        stream: body.stream,
      });

      logger.info(
        { requestId, provider: provider.name, durationMs: Date.now() - startTime },
        'chat/completions: provider responded',
      );

      return reply.send(result);
    } catch (err) {
      return handleError(err, reply, requestId, Date.now() - startTime);
    }
  });

  // ── POST /v1/responses ──────────────────────────────────────
  app.post('/v1/responses', async (request, reply) => {
    const requestId = request.id;
    const parsed = responseRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: {
          message: 'Invalid request body',
          type: 'invalid_request_error',
          requestId,
          details: parsed.error.issues,
        },
      });
    }

    const body = parsed.data;
    logger.info({ requestId, model: body.model }, 'responses: request received');

    const startTime = Date.now();
    try {
      const provider = registry.resolve(body.model, defaultProvider);
      const result = await provider.responses({
        model: body.model,
        input: body.input,
      });

      logger.info(
        { requestId, provider: provider.name, durationMs: Date.now() - startTime },
        'responses: provider responded',
      );

      return reply.send(result);
    } catch (err) {
      return handleError(err, reply, requestId, Date.now() - startTime);
    }
  });

  // ── POST /v1/embeddings ─────────────────────────────────────
  app.post('/v1/embeddings', async (request, reply) => {
    const requestId = request.id;
    const parsed = embeddingRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: {
          message: 'Invalid request body',
          type: 'invalid_request_error',
          requestId,
          details: parsed.error.issues,
        },
      });
    }

    const body = parsed.data;
    logger.info({ requestId, model: body.model }, 'embeddings: request received');

    const startTime = Date.now();
    try {
      const provider = registry.resolve(body.model, defaultProvider);
      const result = await provider.embeddings({
        model: body.model,
        input: body.input,
      });

      logger.info(
        { requestId, provider: provider.name, durationMs: Date.now() - startTime },
        'embeddings: provider responded',
      );

      return reply.send(result);
    } catch (err) {
      return handleError(err, reply, requestId, Date.now() - startTime);
    }
  });
}

/**
 * Tratamento centralizado de erros.
 */
function handleError(
  err: unknown,
  reply: FastifyReply,
  requestId: string,
  durationMs: number,
): void {
  if (err instanceof GatewayError) {
    logger.warn(
      { requestId, code: err.code, statusCode: err.statusCode, durationMs },
      'gateway error',
    );
    reply.status(err.statusCode).send({
      error: {
        message: err.message,
        type: err.code,
        requestId,
        details: err.details,
      },
    });
    return;
  }

  logger.error(
    {
      requestId,
      err: {
        type: err instanceof Error ? err.constructor.name : 'unknown',
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      },
      durationMs,
    },
    'unhandled error in route',
  );

  reply.status(500).send({
    error: {
      message: 'Internal server error',
      type: 'internal_error',
      requestId,
    },
  });
}
