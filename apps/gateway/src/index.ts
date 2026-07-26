import Fastify from 'fastify';
import dotenv from 'dotenv';
import { ProviderRegistry } from '@jove/core';
import { bootstrapRegistry, StubProvider } from '@jove/providers';
import { getDefaultProvider, loadProvidersConfig, logger } from '@jove/shared';

dotenv.config();

const port = Number(process.env['PORT'] ?? 3000);
const host = process.env['HOST'] ?? '0.0.0.0';

// ── Bootstrap do registry ────────────────────────────────────
const registry = new ProviderRegistry();
const providersConfig = loadProvidersConfig();
const configEntries = Object.keys(providersConfig);

if (configEntries.length === 0) {
  // Sem provedores configurados — usa stub para /v1/models funcionar
  registry.register(new StubProvider());
  logger.warn('No providers configured, using StubProvider');
} else {
  bootstrapRegistry(registry, providersConfig);
  logger.info({ providers: configEntries }, 'Providers registered');
}

const defaultProvider = getDefaultProvider();

// ── Servidor Fastify ──────────────────────────────────────────
const app = Fastify({
  logger: false,
});

app.get('/health', async () => ({ status: 'ok', timestamp: Date.now() }));

app.get('/v1/models', async () => {
  const models = await registry.listModels();
  return {
    object: 'list',
    data: models.map((m) => ({
      id: m.id,
      object: m.object ?? 'model',
      created: m.created ?? Date.now(),
      ownedBy: m.provider,
    })),
  };
});

async function main() {
  try {
    await app.listen({ port, host });
    logger.info({ port, host, defaultProvider }, 'Jove gateway started');
  } catch (err) {
    logger.error({ err }, 'Failed to start gateway');
    process.exit(1);
  }
}

main();

export { app, registry };
