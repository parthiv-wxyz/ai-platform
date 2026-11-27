import { describe, expect, it } from "vitest";
import { NoEligibleModelError, routeCodingTask } from "@/lib/ai/router";

describe("coding model router", () => {
  it("selects Qwen for code generation when Ollama is available", () => {
    const decision = routeCodingTask({
      taskType: "CODE_GENERATION",
      availableProviders: new Set(["ollama", "google"]),
    });

    expect(decision).toMatchObject({
      provider: "ollama",
      modelId: "qwen3-coder",
      fallbackUsed: false,
    });
  });

  it("selects Gemini for architecture design", () => {
    const decision = routeCodingTask({
      taskType: "ARCHITECTURE_DESIGN",
      availableProviders: new Set(["google", "ollama"]),
    });

    expect(decision.provider).toBe("google");
  });

  it("honors an eligible user model preference", () => {
    const decision = routeCodingTask({
      taskType: "CODE_REVIEW",
      availableProviders: new Set(["google", "ollama"]),
      preferredProvider: "ollama",
      preferredModel: "qwen3-coder",
    });

    expect(decision).toMatchObject({
      provider: "ollama",
      modelId: "qwen3-coder",
    });
  });

  it("rejects an ineligible model instead of falling back to paid inference", () => {
    expect(() =>
      routeCodingTask({
        taskType: "CODE_GENERATION",
        availableProviders: new Set(["google", "ollama"]),
        preferredProvider: "google",
        preferredModel: "gpt-4o-mini",
      }),
    ).toThrow(NoEligibleModelError);
  });

  it("reports when no eligible provider is available", () => {
    expect(() =>
      routeCodingTask({
        taskType: "DEBUGGING",
        availableProviders: new Set(),
      }),
    ).toThrow("No eligible free coding model");
  });

  it("can route to the mock provider for local tests", () => {
    const decision = routeCodingTask({
      taskType: "TEST_GENERATION",
      availableProviders: new Set(["mock"]),
    });

    expect(decision.modelId).toBe("mock-small");
  });
});
