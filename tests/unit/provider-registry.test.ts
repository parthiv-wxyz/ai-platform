import { describe, expect, it } from "vitest";
import {
  createProviderRegistry,
  ProviderRegistry,
} from "@/lib/ai/providers/registry";
import { MockAiProvider } from "@/lib/ai/providers/mock-provider";

describe("ProviderRegistry", () => {
  it("returns registered providers and rejects unknown providers", () => {
    const registry = new ProviderRegistry();
    const provider = new MockAiProvider();
    registry.register(provider);
    expect(registry.get("mock")).toBe(provider);
    expect(() => registry.get("google")).toThrow("not configured");
  });

  it("registers the configured free external provider", () => {
    const registry = createProviderRegistry({ google: "google-key" }, 1000);

    expect(registry.get("google").provider).toBe("google");
    expect(() => registry.get("paid-provider")).toThrow("not configured");
  });

  it("registers Ollama without a stored API credential", () => {
    const registry = createProviderRegistry(
      { ollama: "http://127.0.0.1:11434" },
      1000,
    );

    expect(registry.get("ollama").provider).toBe("ollama");
  });
});
