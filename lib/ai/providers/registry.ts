import "server-only";
import { getProviderEnv } from "@/lib/env";
import { GeminiProvider } from "@/lib/ai/providers/gemini-provider";
import { OllamaProvider } from "@/lib/ai/providers/ollama-provider";
import type { AiProvider } from "@/types/ai";
import type { ProviderId } from "@/types/ai";

export class ProviderRegistry {
  private readonly providers = new Map<string, AiProvider>();

  register(provider: AiProvider): void {
    this.providers.set(provider.provider, provider);
  }

  get(provider: string): AiProvider {
    const found = this.providers.get(provider);
    if (found === undefined) {
      throw new Error(`Provider is not configured: ${provider}`);
    }
    return found;
  }
}

export function createProviderRegistry(
  credentials: Partial<Record<ProviderId, string>>,
  timeoutMs = getProviderEnv().AI_PROVIDER_TIMEOUT_MS,
): ProviderRegistry {
  const registry = new ProviderRegistry();
  const googleKey = credentials.google;
  const ollamaBaseUrl = credentials.ollama;
  if (googleKey !== undefined)
    registry.register(new GeminiProvider(googleKey, timeoutMs));
  if (ollamaBaseUrl !== undefined)
    registry.register(new OllamaProvider(ollamaBaseUrl, timeoutMs));
  return registry;
}
