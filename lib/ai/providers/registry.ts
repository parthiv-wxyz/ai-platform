import "server-only";
import type { AiProvider } from "@/types/ai";

export type ProviderId = "google" | "mock";

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
