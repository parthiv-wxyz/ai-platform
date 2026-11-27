import { afterEach, describe, expect, it, vi } from "vitest";
import { OllamaProvider } from "@/lib/ai/providers/ollama-provider";

describe("OllamaProvider", () => {
  afterEach(() => vi.restoreAllMocks());

  it("maps a local Ollama chat response to the normalized contract", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message: { content: "Use a typed adapter." },
          prompt_eval_count: 12,
          eval_count: 8,
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    const response = await new OllamaProvider(
      "http://127.0.0.1:11434",
      1000,
    ).generate({
      model: "qwen3-coder",
      messages: [{ role: "user", content: "Review this code." }],
      maxOutputTokens: 100,
    });

    expect(response).toMatchObject({
      provider: "ollama",
      model: "qwen3-coder",
      content: "Use a typed adapter.",
      usage: { inputTokens: 12, outputTokens: 8 },
    });
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:11434/api/chat",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("normalizes an unreachable local server", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("refused"));

    await expect(
      new OllamaProvider("http://127.0.0.1:11434", 1000).generate({
        model: "qwen3-coder",
        messages: [{ role: "user", content: "Review this code." }],
        maxOutputTokens: 100,
      }),
    ).rejects.toMatchObject({
      name: "AiProviderError",
      code: "PROVIDER_UNAVAILABLE",
    });
  });
});
