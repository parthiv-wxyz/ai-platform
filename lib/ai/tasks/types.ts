import { z } from "zod";

export const taskTypeSchema = z.enum([
  "CODE_GENERATION",
  "DEBUGGING",
  "CODE_REVIEW",
  "REFACTORING",
  "TEST_GENERATION",
  "ARCHITECTURE_DESIGN",
  "CODEBASE_ANALYSIS",
]);

export type TaskType = z.infer<typeof taskTypeSchema>;

export const executionConstraintsSchema = z.object({
  maxModelCalls: z.number().int().min(1).max(3).default(1),
  maxOutputTokens: z.number().int().min(1).max(4096).default(700),
  timeoutMs: z.number().int().positive().max(120_000).optional(),
  allowFreeProviderFallback: z.boolean().default(true),
});

export type ExecutionConstraints = z.infer<typeof executionConstraintsSchema>;

export const codingTaskInputSchema = z.object({
  taskId: z.uuid().optional(),
  taskType: taskTypeSchema.optional(),
  input: z.string().trim().min(1).max(50_000),
  language: z.string().trim().min(1).max(80).optional(),
  framework: z.string().trim().min(1).max(120).optional(),
  sourceCode: z.string().max(200_000).optional(),
  errorLogs: z.string().max(100_000).optional(),
  repositoryContext: z.string().max(100_000).optional(),
  constraints: executionConstraintsSchema.default({
    maxModelCalls: 1,
    maxOutputTokens: 700,
    allowFreeProviderFallback: true,
  }),
});

export type CodingTaskInput = z.infer<typeof codingTaskInputSchema>;

export type ClassifiedTask = {
  taskId: string | undefined;
  taskType: TaskType | "UNKNOWN";
  confidence: number;
  reason: string;
  matchedRules: string[];
  needsClarification: boolean;
};
