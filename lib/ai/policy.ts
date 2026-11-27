import {
  executionConstraintsSchema,
  type ExecutionConstraints,
} from "@/lib/ai/tasks/types";

export type ExecutionPolicy = ExecutionConstraints & {
  allowPaidModels: false;
  maxCollaborationRounds: 0 | 1;
  retryProviderCalls: false;
};

export function createExecutionPolicy(
  constraints: Partial<ExecutionConstraints> = {},
): ExecutionPolicy {
  const parsed = executionConstraintsSchema.parse(constraints);
  return {
    ...parsed,
    allowPaidModels: false,
    maxCollaborationRounds: parsed.maxModelCalls > 1 ? 1 : 0,
    retryProviderCalls: false,
  };
}
