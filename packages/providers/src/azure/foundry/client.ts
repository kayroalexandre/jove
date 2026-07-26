import OpenAI from 'openai';
import { logger } from '@jove/shared';

export interface AzureFoundryClientOptions {
  /** Endpoint completo do Azure AI Foundry, ex: https://tino-resource.services.ai.azure.com/openai/v1 */
  endpoint: string;
  /** Nome do deployment no Azure, ex: gpt-5.6-sol */
  deploymentName: string;
  /** API key do Azure AI Foundry */
  apiKey: string;
}

/**
 * Cliente Azure AI Foundry usando o SDK OpenAI com API key direta.
 *
 * Este cliente encapsula a configuração de autenticação e expõe
 * a instância do OpenAI SDK para uso pelo provider.
 *
 * Autenticação:
 * - Usa API key direta passada no construtor
 * - A chave é lida de AZURE_AI_API_KEY no .env
 */
export class AzureFoundryClient {
  readonly endpoint: string;
  readonly deploymentName: string;
  readonly client: OpenAI;

  constructor(opts: AzureFoundryClientOptions) {
    this.endpoint = opts.endpoint.replace(/\/$/, '');
    this.deploymentName = opts.deploymentName;

    this.client = new OpenAI({
      baseURL: this.endpoint,
      apiKey: opts.apiKey,
    });

    logger.debug(
      { endpoint: this.endpoint, deployment: this.deploymentName },
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
