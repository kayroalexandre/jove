import type { ProviderRegistry, ProvidersConfig } from '@jove/core';
import { createAzureFoundryProvider } from './azure/foundry';

/**
 * Registra provedores habilitados no registry a partir da configuração.
 *
 * Para cada provedor habilitado:
 * 1. cria a instância do provider;
 * 2. registra no registry;
 * 3. indexa cada modelo no registry (modelId -> providerName).
 */
export function bootstrapRegistry(registry: ProviderRegistry, config: ProvidersConfig): void {
  for (const [name, providerConfig] of Object.entries(config)) {
    if (!providerConfig.enabled) {
      continue;
    }

    switch (name) {
      case 'azure': {
        const provider = createAzureFoundryProvider(providerConfig);
        registry.register(provider);

        // Indexa modelos do Azure no registry
        for (const model of providerConfig.models ?? []) {
          registry.registerModel(model, provider.name);
        }
        if (providerConfig.defaultModel) {
          registry.registerModel(providerConfig.defaultModel, provider.name);
        }
        break;
      }

      default:
        // Futuros provedores serão adicionados aqui
        break;
    }
  }
}
