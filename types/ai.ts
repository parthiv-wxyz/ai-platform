export type AiMessageRole = "system" | "user" | "assistant";

export type AiMessage = {
  role: AiMessageRole;
  content: string;
};

export type GenerateRequest = {
  model: string;
  messages: readonly AiMessage[];
  maxOutputTokens: number;
};

export type Usage = {
  inputTokens: number;
  outputTokens: number;
};

export type GenerateResponse = {
  content: string;
  provider: string;
  model: string;
  finishReason: "stop" | "length";
  usage: Usage;
};

export interface AiProvider {
  readonly provider: string;
  generate(request: GenerateRequest): Promise<GenerateResponse>;
}
