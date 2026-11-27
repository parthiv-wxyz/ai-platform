import "server-only";
import { GoogleGenAI } from "@google/genai";
import { getProviderEnv } from "@/lib/env";
import { withProviderTimeout } from "@/lib/ai/providers/with-timeout";
import {
  AiProviderError,
  type AiProvider,
  type GenerateRequest,
  type GenerateResponse,
} from "@/types/ai";

export class GeminiProvider implements AiProvider {
  readonly provider = "google";

  constructor(
    private readonly apiKey: string,
    private readonly timeoutMs = getProviderEnv().AI_PROVIDER_TIMEOUT_MS,
  ) {}

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const startedAt = Date.now();
    const ai = new GoogleGenAI({ apiKey: this.apiKey });
    const system = request.messages.find(
      (message) => message.role === "system",
    )?.content;
    const contents = request.messages
      .filter((message) => message.role !== "system")
      .map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }],
      }));

    try {
      const response = await withProviderTimeout(
        (signal) =>
          ai.models.generateContent({
            model: request.model,
            contents,
            config: {
              systemInstruction: system,
              maxOutputTokens: request.maxOutputTokens,
              temperature: request.temperature,
              abortSignal: signal,
            },
          }),
        this.timeoutMs,
        request.signal,
      );
      const text = response.text ?? "";
      const finishReason = response.candidates?.[0]?.finishReason;
      return {
        content: text,
        provider: this.provider,
        model: request.model,
        finishReason: finishReason === "MAX_TOKENS" ? "length" : "stop",
        usage: {
          inputTokens: response.usageMetadata?.promptTokenCount ?? null,
          outputTokens: response.usageMetadata?.candidatesTokenCount ?? null,
          cachedInputTokens:
            response.usageMetadata?.cachedContentTokenCount ?? null,
        },
        latencyMs: Date.now() - startedAt,
      };
    } catch (error) {
      throw normalizeGeminiError(error);
    }
  }
}

function normalizeGeminiError(error: unknown): AiProviderError {
  const message =
    error instanceof Error ? error.message : "Gemini request failed.";
  const status =
    typeof error === "object" && error !== null && "status" in error
      ? String(error.status)
      : "";
  const lower = `${status} ${message}`.toLowerCase();
  if (lower.includes("timeout") || lower.includes("aborted")) {
    return new AiProviderError(
      "TIMEOUT",
      "Gemini did not respond in time.",
      true,
      { cause: error },
    );
  }
  if (
    lower.includes("401") ||
    lower.includes("403") ||
    lower.includes("api key") ||
    lower.includes("unauthenticated")
  ) {
    return new AiProviderError(
      "AUTHENTICATION_INVALID",
      "The Gemini API key was rejected.",
      false,
      { cause: error },
    );
  }
  if (lower.includes("429") || lower.includes("rate")) {
    return new AiProviderError(
      "RATE_LIMITED",
      "Gemini is temporarily rate-limiting requests.",
      true,
      { cause: error },
    );
  }
  if (lower.includes("quota")) {
    return new AiProviderError(
      "QUOTA_EXHAUSTED",
      "The Gemini API quota is exhausted.",
      false,
      { cause: error },
    );
  }
  if (
    lower.includes("404") ||
    lower.includes("not found") ||
    lower.includes("not supported") ||
    lower.includes("model is unavailable")
  ) {
    return new AiProviderError(
      "MODEL_UNAVAILABLE",
      "The selected Gemini model is unavailable.",
      false,
      { cause: error },
    );
  }
  return new AiProviderError(
    "PROVIDER_ERROR",
    "Gemini could not complete the request.",
    false,
    { cause: error },
  );
}
