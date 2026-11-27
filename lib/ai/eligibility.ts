import { getCodingModel, type CodingModel } from "@/lib/ai/model-registry";
import type { ProviderId } from "@/types/ai";

export type ModelEligibility = CodingModel;

export class FreeModelEligibilityError extends Error {
  readonly code = "MODEL_NOT_FREE";

  constructor(modelId: string) {
    super(`Model is not enabled for free-only execution: ${modelId}`);
    this.name = "FreeModelEligibilityError";
  }
}

export function getModelEligibility(
  provider: ProviderId,
  modelId: string,
): ModelEligibility | null {
  const model = getCodingModel(provider, modelId);
  return model?.availability === "enabled" &&
    model.enabled &&
    model.freeTierEligible
    ? model
    : null;
}

export function assertFreeModelEligible(
  provider: ProviderId,
  modelId: string,
): ModelEligibility {
  const eligibility = getModelEligibility(provider, modelId);
  if (eligibility === null) throw new FreeModelEligibilityError(modelId);
  return eligibility;
}
