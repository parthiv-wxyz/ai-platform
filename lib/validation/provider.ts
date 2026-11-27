import { z } from "zod";
import { taskTypeSchema } from "@/lib/ai/tasks/types";

export const connectedProviderIdSchema = z.literal("google");
export const chatProviderIdSchema = z.enum(["google", "ollama"]);
export const providerConnectionInputSchema = z.object({
  provider: connectedProviderIdSchema,
  label: z.string().trim().min(1).max(80),
  apiKey: z.string().trim().min(20).max(500),
});
export const connectionIdSchema = z.uuid();
export const chatInputSchema = z.object({
  conversationId: z.uuid(),
  message: z.string().trim().min(1).max(50000),
  provider: chatProviderIdSchema.default("google"),
  model: z.string().trim().min(1).max(120).optional(),
  taskType: taskTypeSchema.optional(),
  language: z.string().trim().min(1).max(80).optional(),
  framework: z.string().trim().min(1).max(120).optional(),
  sourceCode: z.string().max(200_000).optional(),
  errorLogs: z.string().max(100_000).optional(),
  repositoryContext: z.string().max(100_000).optional(),
  maxOutputTokens: z.number().int().min(1).max(4096).default(700),
});
