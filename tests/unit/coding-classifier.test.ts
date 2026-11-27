import { describe, expect, it } from "vitest";
import { classifyCodingTask } from "@/lib/ai/tasks";

describe("coding task classifier", () => {
  it.each([
    ["implement a function that parses JSON", "CODE_GENERATION"],
    ["debug this stack trace", "DEBUGGING"],
    ["review this code for security issues", "CODE_REVIEW"],
    ["refactor this class", "REFACTORING"],
    ["generate unit tests for this module", "TEST_GENERATION"],
    ["design the architecture for this service", "ARCHITECTURE_DESIGN"],
    ["explain this repository structure", "CODEBASE_ANALYSIS"],
  ])("classifies %s as %s", (input, taskType) => {
    expect(classifyCodingTask({ input }).taskType).toBe(taskType);
  });

  it("honors an explicit task type", () => {
    expect(
      classifyCodingTask({
        input: "Make this better",
        taskType: "CODE_REVIEW",
      }),
    ).toMatchObject({
      taskType: "CODE_REVIEW",
      confidence: 1,
      needsClarification: false,
    });
  });

  it("requests clarification for unknown or ambiguous input", () => {
    expect(classifyCodingTask({ input: "Hello there" })).toMatchObject({
      taskType: "UNKNOWN",
      confidence: 0,
      needsClarification: true,
    });
    expect(
      classifyCodingTask({ input: "review and refactor this implementation" }),
    ).toMatchObject({
      taskType: "UNKNOWN",
      confidence: 0.4,
      needsClarification: true,
    });
  });

  it("rejects invalid task input", () => {
    expect(() => classifyCodingTask({ input: "" })).toThrow();
    expect(() =>
      classifyCodingTask({ input: "Implement it", taskType: "CHAT" }),
    ).toThrow();
  });
});
