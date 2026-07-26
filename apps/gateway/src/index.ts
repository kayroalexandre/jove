import Fastify from 'fastify';
import dotenv from 'dotenv';
import { logger } from '@jove/shared';

dotenv.config();

const port = Number(process.env['PORT'] ?? 3000);
const host = process.env['HOST'] ?? '0.0.0.0';

const app = Fastify({
  logger: false,
});

app.get('/health', async () => ({ status: 'ok', timestamp: Date.now() }));

app.get('/v1/models', async () => {
  return {
    object: 'list',
    data: [{ id: 'stub-model', object: 'model', ownedBy: 'jove' }],
  };
});

async function main() {
  try {
    await app.listen({ port, host });
    logger.info({ port, host }, 'Jove gateway started');
  } catch (err) {
    logger.error({ err }, 'Failed to start gateway');
    process.exit(1);
  }
}

main();

export { app };
