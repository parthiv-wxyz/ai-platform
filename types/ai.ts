export type AiMessageRole = "system" | "user" | "assistant";

export type AiMessage = {
  role: AiMessageRole;
  content: string;
};

export type GenerateRequest = {
  model: string;
  messages: readonly AiMessage[];
  maxOutputTokens: number;
  temperature?: number;
  signal?: AbortSignal;
};

export type Usage = {
  inputTokens: number | null;
  outputTokens: number | null;
  cachedInputTokens?: number | null;
};

export type GenerateResponse = {
  content: string;
  provider: string;
  model: string;
  finishReason: "stop" | "length";
  usage: Usage;
  requestId?: string;
  latencyMs?: number;
};

export interface AiProvider {
  readonly provider: string;
  generate(request: GenerateRequest): Promise<GenerateResponse>;
}

export type AiProviderErrorCode =
  | "AUTHENTICATION_INVALID"
  | "QUOTA_EXHAUSTED"
  | "RATE_LIMITED"
  | "MODEL_UNAVAILABLE"
  | "REQUEST_INVALID"
  | "TIMEOUT"
  | "PROVIDER_UNAVAILABLE"
  | "PROVIDER_ERROR";

export class AiProviderError extends Error {
  constructor(
    readonly code: AiProviderErrorCode,
    message: string,
    readonly retryable = false,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "AiProviderError";
  }
}
