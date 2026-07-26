import OpenAI from 'openai';
import { DefaultAzureCredential, getBearerTokenProvider } from '@azure/identity';
import { logger } from '@jove/shared';

export interface AzureFoundryClientOptions {
  /** Endpoint completo do Azure AI Foundry, ex: https://tino-resource.services.ai.azure.com/openai/v1 */
  endpoint: string;
  /** Nome do deployment no Azure, ex: gpt-5.6-sol */
  deploymentName: string;
  /** Escopo do token, padrão: https://ai.azure.com/.default */
  tokenScope?: string;
}

/**
 * Cliente Azure AI Foundry usando o SDK OpenAI com DefaultAzureCredential.
 *
 * Este cliente encapsula a configuração de autenticação e expõe
 * a instância do OpenAI SDK para uso pelo provider.
 *
 * Autenticação:
 * - Usa DefaultAzureCredential (suporta managed identity, env vars, etc.)
 * - Gera token bearer via getBearerTokenProvider
 * - Passa o token como apiKey no cliente OpenAI
 */
export class AzureFoundryClient {
  readonly endpoint: string;
  readonly deploymentName: string;
  readonly client: OpenAI;

  constructor(opts: AzureFoundryClientOptions) {
    this.endpoint = opts.endpoint.replace(/\/$/, '');
    this.deploymentName = opts.deploymentName;
    const scope = opts.tokenScope ?? 'https://ai.azure.com/.default';

    const tokenProvider = getBearerTokenProvider(
      new DefaultAzureCredential(),
      scope,
    );

    this.client = new OpenAI({
      baseURL: this.endpoint,
      apiKey: tokenProvider as unknown as string,
    });

    logger.debug(
      { endpoint: this.endpoint, deployment: this.deploymentName, scope },
      'AzureFoundryClient initialized',
    );
  }

  /**
   * Retorna a URL base do endpoint.
   */
  get baseURL(): string {
    return this.client.baseURL;
  }
}
