import type { ProviderConfig, ProvidersConfig } from '@jove/core';

/**
 * Carrega a configuração de provedores a partir de variáveis de ambiente.
 *
 * No futuro, poderá ser estendida para ler de arquivos YAML/JSON.
 */
export function loadProvidersConfig(): ProvidersConfig {
  const providers: ProvidersConfig = {};

  // Azure AI Foundry
  if (process.env['AZURE_AI_ENDPOINT']) {
    const modelsCsv = process.env['AZURE_AI_MODELS'];
    const models = modelsCsv ? modelsCsv.split(',').map((m) => m.trim()) : undefined;
    const defaultModel =
      process.env['AZURE_AI_DEFAULT_MODEL'] ??
      process.env['AZURE_AI_DEPLOYMENT_NAME'] ??
      models?.[0];

    providers['azure'] = {
      enabled: true,
      endpoint: process.env['AZURE_AI_ENDPOINT'],
      apiVersion: process.env['AZURE_AI_API_VERSION'] ?? '2024-10-21',
      defaultModel,
      models,
    };
  }

  return providers;
}

/**
 * Retorna o nome do provedor padrão a ser usado quando o modelo
 * não está explicitamente mapeado.
 */
export function getDefaultProvider(): string | undefined {
  return process.env['DEFAULT_PROVIDER'] ?? 'azure';
}

/**
 * Helper para acessar variáveis de ambiente com fallback.
 */
export function env(key: string, fallback?: string): string | undefined {
  return process.env[key] ?? fallback;
}

export type { ProviderConfig, ProvidersConfig };
