import type { ProviderId } from "@/types/ai";
import type { TaskType } from "@/lib/ai/tasks/types";

export type ModelAvailability = "enabled" | "disabled" | "unverified";
export type CodingCapability =
  "coding_specialist" | "coding_generalist" | "deterministic_test";

export type CodingModel = {
  provider: ProviderId;
  modelId: string;
  displayName: string;
  codingCapability: CodingCapability;
  contextWindowTokens: number | null;
  inputModalities: readonly ["text"];
  outputModalities: readonly ["text"];
  supportsStreaming: boolean;
  accessType: "free_api" | "local";
  freeTierEligible: boolean;
  freeTierLimitations: string;
  availability: ModelAvailability;
  enabled: boolean;
  supportedTaskTypes: readonly TaskType[];
  eligibilityVerifiedAt: string;
};

export const CODING_MODEL_REGISTRY: readonly CodingModel[] = [
  {
    provider: "google",
    modelId: "gemini-3.5-flash-lite",
    displayName: "Gemini 3.5 Flash-Lite",
    codingCapability: "coding_generalist",
    contextWindowTokens: null,
    inputModalities: ["text"],
    outputModalities: ["text"],
    supportsStreaming: false,
    accessType: "free_api",
    freeTierEligible: true,
    freeTierLimitations: "Google free-tier rate and daily quotas apply.",
    availability: "enabled",
    enabled: true,
    supportedTaskTypes: [
      "DEBUGGING",
      "CODE_REVIEW",
      "ARCHITECTURE_DESIGN",
      "CODEBASE_ANALYSIS",
      "CODE_GENERATION",
    ],
    eligibilityVerifiedAt: "2026-11-27",
  },
  {
    provider: "ollama",
    modelId: "qwen3-coder",
    displayName: "Qwen3-Coder via Ollama",
    codingCapability: "coding_specialist",
    contextWindowTokens: null,
    inputModalities: ["text"],
    outputModalities: ["text"],
    supportsStreaming: false,
    accessType: "local",
    freeTierEligible: true,
    freeTierLimitations:
      "No provider API quota; requires a running local Ollama service and sufficient hardware.",
    availability: "enabled",
    enabled: true,
    supportedTaskTypes: [
      "CODE_GENERATION",
      "DEBUGGING",
      "CODE_REVIEW",
      "REFACTORING",
      "TEST_GENERATION",
      "ARCHITECTURE_DESIGN",
      "CODEBASE_ANALYSIS",
    ],
    eligibilityVerifiedAt: "2026-11-27",
  },
  {
    provider: "mock",
    modelId: "mock-small",
    displayName: "Local mock model",
    codingCapability: "deterministic_test",
    contextWindowTokens: null,
    inputModalities: ["text"],
    outputModalities: ["text"],
    supportsStreaming: false,
    accessType: "local",
    freeTierEligible: true,
    freeTierLimitations:
      "Local deterministic test provider; no external request.",
    availability: "enabled",
    enabled: true,
    supportedTaskTypes: [
      "CODE_GENERATION",
      "DEBUGGING",
      "CODE_REVIEW",
      "REFACTORING",
      "TEST_GENERATION",
      "ARCHITECTURE_DESIGN",
      "CODEBASE_ANALYSIS",
    ],
    eligibilityVerifiedAt: "2026-11-27",
  },
];

export function getCodingModel(
  provider: ProviderId,
  modelId: string,
): CodingModel | null {
  return (
    CODING_MODEL_REGISTRY.find(
      (model) => model.provider === provider && model.modelId === modelId,
    ) ?? null
  );
}
