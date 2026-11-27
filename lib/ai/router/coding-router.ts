import {
  assertFreeModelEligible,
  type ModelEligibility,
} from "@/lib/ai/eligibility";
import { getCodingModel } from "@/lib/ai/model-registry";
import type { TaskType } from "@/lib/ai/tasks/types";
import type { ProviderId } from "@/types/ai";

const PREFERRED_PROVIDERS: Record<TaskType, readonly ProviderId[]> = {
  CODE_GENERATION: ["ollama", "google", "mock"],
  DEBUGGING: ["ollama", "google", "mock"],
  CODE_REVIEW: ["google", "ollama", "mock"],
  REFACTORING: ["ollama", "google", "mock"],
  TEST_GENERATION: ["ollama", "google", "mock"],
  ARCHITECTURE_DESIGN: ["google", "ollama", "mock"],
  CODEBASE_ANALYSIS: ["google", "ollama", "mock"],
};

export type CodingRouteRequest = {
  taskType: TaskType;
  availableProviders: ReadonlySet<ProviderId>;
  preferredProvider?: ProviderId;
  preferredModel?: string;
  allowFreeProviderFallback?: boolean;
};

export type CodingRouteDecision = {
  provider: ProviderId;
  modelId: string;
  model: ModelEligibility;
  reason: string;
  fallbackUsed: boolean;
  consideredProviders: ProviderId[];
};

export class NoEligibleModelError extends Error {
  readonly code = "NO_ELIGIBLE_MODEL";

  constructor(taskType: TaskType) {
    super(`No eligible free coding model is available for ${taskType}.`);
    this.name = "NoEligibleModelError";
  }
}

export function routeCodingTask(
  request: CodingRouteRequest,
): CodingRouteDecision {
  const preferredProviders = request.preferredProvider
    ? [
        request.preferredProvider,
        ...PREFERRED_PROVIDERS[request.taskType].filter(
          (provider) => provider !== request.preferredProvider,
        ),
      ]
    : [...PREFERRED_PROVIDERS[request.taskType]];
  const providers = preferredProviders.filter((provider) =>
    request.availableProviders.has(provider),
  );
  const consideredProviders = [...providers];

  if (request.preferredModel !== undefined) {
    const preferredProvider = request.preferredProvider;
    if (preferredProvider === undefined) {
      throw new NoEligibleModelError(request.taskType);
    }
    const model = getCodingModel(preferredProvider, request.preferredModel);
    if (
      model === null ||
      !model.supportedTaskTypes.includes(request.taskType) ||
      !request.availableProviders.has(preferredProvider)
    ) {
      throw new NoEligibleModelError(request.taskType);
    }
    assertFreeModelEligible(preferredProvider, request.preferredModel);
    return {
      provider: preferredProvider,
      modelId: request.preferredModel,
      model,
      reason: "Selected the user-preferred eligible model.",
      fallbackUsed: false,
      consideredProviders,
    };
  }

  for (const [index, provider] of providers.entries()) {
    const modelId =
      provider === "ollama"
        ? "qwen3-coder"
        : provider === "mock"
          ? "mock-small"
          : "gemini-3.5-flash-lite";
    const model = getCodingModel(provider, modelId);
    if (
      model !== null &&
      model.supportedTaskTypes.includes(request.taskType) &&
      model.availability === "enabled" &&
      model.freeTierEligible
    ) {
      return {
        provider,
        modelId,
        model: assertFreeModelEligible(provider, modelId),
        reason:
          index === 0
            ? `Selected the preferred ${provider} coding route for ${request.taskType}.`
            : `Preferred route was unavailable; selected the next eligible free route for ${request.taskType}.`,
        fallbackUsed: index > 0,
        consideredProviders,
      };
    }
  }

  throw new NoEligibleModelError(request.taskType);
}
