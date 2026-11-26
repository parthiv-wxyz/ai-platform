import { z } from "zod";

export const providerIdSchema = z.literal("google");
export const providerConnectionInputSchema = z.object({
  provider: providerIdSchema,
  label: z.string().trim().min(1).max(80),
  apiKey: z.string().trim().min(20).max(500),
});
export const connectionIdSchema = z.uuid();
export const chatInputSchema = z.object({
  conversationId: z.uuid(),
  message: z.string().trim().min(1).max(50000),
  model: z.string().trim().min(1).max(120).optional(),
  maxOutputTokens: z.number().int().min(1).max(4096).default(700),
});
