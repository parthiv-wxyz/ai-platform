import "server-only";
import { getProviderEnv } from "@/lib/env";
import { withProviderTimeout } from "@/lib/ai/providers/with-timeout";
import {
  AiProviderError,
  type AiProvider,
  type GenerateRequest,
  type GenerateResponse,
} from "@/types/ai";

type OllamaResponse = {
  message?: { content?: unknown };
  prompt_eval_count?: number;
  eval_count?: number;
};

export class OllamaProvider implements AiProvider {
  readonly provider = "ollama";

  constructor(
    private readonly baseUrl = getProviderEnv().OLLAMA_BASE_URL,
    private readonly timeoutMs = getProviderEnv().AI_PROVIDER_TIMEOUT_MS,
  ) {}

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const startedAt = Date.now();
    let response: Response;
    try {
      response = await withProviderTimeout(
        (signal) =>
          fetch(`${this.baseUrl.replace(/\/$/, "")}/api/chat`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              model: request.model,
              messages: request.messages,
              stream: false,
              options: { num_predict: request.maxOutputTokens },
            }),
            signal,
          }),
        this.timeoutMs,
        request.signal,
      );
    } catch (error) {
      if (error instanceof AiProviderError) throw error;
      throw new AiProviderError(
        "PROVIDER_UNAVAILABLE",
        "Ollama is not running or cannot be reached locally.",
        true,
        { cause: error },
      );
    }

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      const lower = detail.toLowerCase();
      if (response.status === 404 || lower.includes("model")) {
        throw new AiProviderError(
          "MODEL_UNAVAILABLE",
          "The selected local Ollama model is unavailable. Pull it with Ollama first.",
          false,
        );
      }
      throw new AiProviderError(
        "PROVIDER_ERROR",
        "Ollama could not complete the local request.",
        false,
      );
    }

    const payload = (await response.json()) as OllamaResponse;
    return {
      content:
        typeof payload.message?.content === "string"
          ? payload.message.content
          : "",
      provider: this.provider,
      model: request.model,
      finishReason: "stop",
      usage: {
        inputTokens: payload.prompt_eval_count ?? null,
        outputTokens: payload.eval_count ?? null,
      },
      latencyMs: Date.now() - startedAt,
    };
  }
}

export async function isOllamaAvailable(
  baseUrl = getProviderEnv().OLLAMA_BASE_URL,
  timeoutMs = getProviderEnv().AI_PROVIDER_TIMEOUT_MS,
): Promise<boolean> {
  try {
    const response = await withProviderTimeout(
      (signal) =>
        fetch(`${baseUrl.replace(/\/$/, "")}/api/tags`, {
          method: "GET",
          signal,
        }),
      timeoutMs,
    );
    return response.ok;
  } catch {
    return false;
  }
}
