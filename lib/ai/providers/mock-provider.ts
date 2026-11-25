import type { AiProvider, GenerateRequest, GenerateResponse } from "@/types/ai";

const tokenCount = (value: string): number =>
  value.trim() === "" ? 0 : value.trim().split(/\s+/u).length;

export class MockAiProvider implements AiProvider {
  readonly provider = "mock";

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const lastUserMessage = [...request.messages]
      .reverse()
      .find((message) => message.role === "user");
    const prompt = lastUserMessage?.content.trim() || "your request";
    const content = `Mock response for: ${prompt}`;
    const outputTokens = Math.min(tokenCount(content), request.maxOutputTokens);

    return {
      content,
      provider: this.provider,
      model: request.model,
      finishReason: outputTokens < tokenCount(content) ? "length" : "stop",
      usage: {
        inputTokens: request.messages.reduce(
          (total, message) => total + tokenCount(message.content),
          0,
        ),
        outputTokens,
      },
    };
  }
}
