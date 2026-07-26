import type { FastifyInstance } from 'fastify';
import { logger } from '@jove/shared';

/**
 * Plugin de observabilidade.
 *
 * Adiciona:
 * - request ID único por requisição (X-Request-Id)
 * - log de início e fim de cada requisição
 * - tempo de resposta (latência)
 * - status code no log
 */
export async function registerObservability(app: FastifyInstance): Promise<void> {
  // Hook executado antes de cada rota
  app.addHook('onRequest', async (request, reply) => {
    const requestId =
      (request.headers['x-request-id'] as string | undefined) ??
      crypto.randomUUID();

    request.id = requestId;
    reply.header('X-Request-Id', requestId);

    // Marca o início para calcular latência
    (request as RequestWithTiming).__startTime = Date.now();

    logger.info(
      {
        requestId,
        method: request.method,
        url: request.url,
      },
      'request started',
    );
  });

  // Hook executado após cada resposta
  app.addHook('onResponse', async (request, reply) => {
    const startTime = (request as RequestWithTiming).__startTime ?? Date.now();
    const durationMs = Date.now() - startTime;

    logger.info(
      {
        requestId: request.id,
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        durationMs,
      },
      'request completed',
    );
  });

  // Hook de erro global
  app.setErrorHandler((err, request, reply) => {
    const requestId = request.id;
    const startTime = (request as RequestWithTiming).__startTime ?? Date.now();
    const durationMs = Date.now() - startTime;

    const errInfo = err instanceof Error
      ? { type: err.constructor.name, message: err.message, stack: err.stack }
      : { type: 'unknown', message: String(err), stack: undefined };

    logger.error(
      {
        requestId,
        err: errInfo,
        durationMs,
      },
      'request error',
    );

    reply.status(500).send({
      error: {
        message: 'Internal server error',
        type: 'internal_error',
        requestId,
      },
    });
  });
}

interface RequestWithTiming {
  __startTime?: number;
}
