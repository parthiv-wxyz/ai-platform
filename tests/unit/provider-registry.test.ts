import { describe, expect, it } from "vitest";
import { ProviderRegistry } from "@/lib/ai/providers/registry";
import { MockAiProvider } from "@/lib/ai/providers/mock-provider";

describe("ProviderRegistry", () => {
  it("returns registered providers and rejects unknown providers", () => {
    const registry = new ProviderRegistry();
    const provider = new MockAiProvider();
    registry.register(provider);
    expect(registry.get("mock")).toBe(provider);
    expect(() => registry.get("google")).toThrow("not configured");
  });
});
