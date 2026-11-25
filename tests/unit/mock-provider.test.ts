import { describe, expect, it } from "vitest";
import { MockAiProvider } from "@/lib/ai/providers/mock-provider";

describe("MockAiProvider", () => {
  it("returns a deterministic normalized response", async () => {
    const provider = new MockAiProvider();
    const request = {
      model: "mock-small",
      messages: [{ role: "user" as const, content: "Explain indexing" }],
      maxOutputTokens: 20,
    };

    await expect(provider.generate(request)).resolves.toEqual({
      content: "Mock response for: Explain indexing",
      provider: "mock",
      model: "mock-small",
      finishReason: "stop",
      usage: { inputTokens: 2, outputTokens: 5 },
    });
  });

  it("uses the latest user message and honors output limits", async () => {
    const provider = new MockAiProvider();
    const response = await provider.generate({
      model: "mock-small",
      messages: [
        { role: "user", content: "first" },
        { role: "assistant", content: "ignored" },
        { role: "user", content: "second question" },
      ],
      maxOutputTokens: 2,
    });

    expect(response.content).toBe("Mock response for: second question");
    expect(response.finishReason).toBe("length");
    expect(response.usage.outputTokens).toBe(2);
  });
});
