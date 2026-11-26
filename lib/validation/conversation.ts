import { z } from "zod";

export const conversationTitleSchema = z
  .string()
  .trim()
  .min(1, "A conversation title is required.")
  .max(200, "Conversation titles must be 200 characters or fewer.");

export const createConversationSchema = z
  .object({
    title: conversationTitleSchema.default("New conversation"),
  })
  .strict();

export const updateConversationSchema = z
  .object({
    title: conversationTitleSchema,
  })
  .strict();

export const conversationIdSchema = z.string().uuid("Invalid conversation ID.");
