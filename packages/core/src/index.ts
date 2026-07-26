/**
 * Contratos centrais do gateway.
 *
 * Toda implementação de provedor deve satisfazer a interface {@link AIProvider}.
 */

export interface ProviderModel {
  id: string;
  provider: string;
  object?: string;
  created?: number;
  ownedBy?: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
}

export interface ChatCompletionResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: ChatChoice[];
}

export interface ChatChoice {
  index: number;
  message: ChatMessage;
  finishReason: string;
}

export interface ResponseRequest {
  model: string;
  input: string | ChatMessage[];
}

export interface ResponseResponse {
  id: string;
  model: string;
  output: unknown;
}

export interface EmbeddingRequest {
  model: string;
  input: string | string[];
}

export interface EmbeddingResponse {
  model: string;
  data: EmbeddingItem[];
}

export interface EmbeddingItem {
  object: 'embedding';
  index: number;
  embedding: number[];
}

/**
 * Interface que todo provedor deve implementar.
 */
export interface AIProvider {
  readonly name: string;
  models(): Promise<ProviderModel[]>;
  chat(input: ChatCompletionRequest): Promise<ChatCompletionResponse>;
  responses(input: ResponseRequest): Promise<ResponseResponse>;
  embeddings(input: EmbeddingRequest): Promise<EmbeddingResponse>;
}
