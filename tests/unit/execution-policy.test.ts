import { describe, expect, it } from "vitest";
import { createExecutionPolicy } from "@/lib/ai/policy";

describe("execution policy", () => {
  it("defaults to one call with no paid fallback or retries", () => {
    expect(createExecutionPolicy()).toMatchObject({
      maxModelCalls: 1,
      maxCollaborationRounds: 0,
      allowPaidModels: false,
      retryProviderCalls: false,
    });
  });

  it("keeps bounded review policy finite", () => {
    expect(
      createExecutionPolicy({ maxModelCalls: 2, maxOutputTokens: 1000 }),
    ).toMatchObject({
      maxModelCalls: 2,
      maxCollaborationRounds: 1,
      maxOutputTokens: 1000,
      allowPaidModels: false,
    });
  });
});
