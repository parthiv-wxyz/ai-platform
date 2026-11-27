import { describe, expect, it } from "vitest";
import {
  assertFreeModelEligible,
  getModelEligibility,
} from "@/lib/ai/eligibility";

describe("free model eligibility", () => {
  it("allows the explicitly verified Gemini free-tier model", () => {
    expect(
      getModelEligibility("google", "gemini-3.5-flash-lite"),
    ).toMatchObject({
      accessType: "free_api",
      freeTierEligible: true,
      enabled: true,
    });
  });

  it("allows the local Qwen model without treating it as an API plan", () => {
    expect(getModelEligibility("ollama", "qwen3-coder")).toMatchObject({
      accessType: "local",
      freeTierEligible: true,
      freeTierLimitations: expect.stringContaining("local Ollama"),
    });
  });

  it("rejects unknown and paid model identifiers", () => {
    expect(() => assertFreeModelEligible("google", "gpt-4o-mini")).toThrow(
      "free-only",
    );
    expect(() => assertFreeModelEligible("google", "unknown-model")).toThrow(
      "free-only",
    );
  });

  it("does not trust client-provided eligibility metadata", () => {
    const clientMetadata = { modelId: "gpt-4o-mini", freeTierEligible: true };
    expect(() =>
      assertFreeModelEligible("google", clientMetadata.modelId),
    ).toThrow("free-only");
  });
});
