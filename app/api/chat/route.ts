import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  createProviderConnectionService,
  ProviderConnectionNotFoundError,
} from "@/lib/db/provider-connections";
import {
  createConversationService,
  ConversationNotFoundError,
} from "@/lib/db/conversations";
import { GeminiProvider } from "@/lib/ai/providers/gemini-provider";
import { chatInputSchema } from "@/lib/validation/provider";
import type { AiMessage } from "@/types/ai";
import { getProviderEnv } from "@/lib/env";

export async function POST(request: Request) {
  try {
    const input = chatInputSchema.parse((await request.json()) as unknown);
    const supabase = await createServerSupabaseClient();
    const { data: auth } = await supabase.auth.getUser();
    if (auth.user === null)
      return NextResponse.json(
        { error: { code: "AUTH_REQUIRED", message: "Sign in required." } },
        { status: 401 },
      );

    const conversation = await (
      await createConversationService()
    ).find(input.conversationId);
    const { data: priorMessages, error: messagesError } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversation.id)
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: true });
    if (messagesError !== null) throw messagesError;
    const messages = [
      ...(priorMessages as AiMessage[]),
      { role: "user" as const, content: input.message },
    ];
    const connectionService = await createProviderConnectionService();
    const credential =
      await connectionService.getCredentialFromAnyOwnedGoogleConnection();
    const response = await new GeminiProvider(credential.apiKey).generate({
      model: input.model ?? getProviderEnv().GEMINI_DEFAULT_MODEL,
      messages,
      maxOutputTokens: input.maxOutputTokens,
      signal: request.signal,
    });

    const userMessageCreatedAt = new Date();
    const assistantMessageCreatedAt = new Date(
      userMessageCreatedAt.getTime() + 1,
    ).toISOString();
    const { error: insertError } = await supabase.from("messages").insert([
      {
        conversation_id: conversation.id,
        user_id: auth.user.id,
        role: "user",
        content: input.message,
        created_at: userMessageCreatedAt.toISOString(),
      },
      {
        conversation_id: conversation.id,
        user_id: auth.user.id,
        role: "assistant",
        content: response.content,
        created_at: assistantMessageCreatedAt,
      },
    ]);
    if (insertError !== null) throw insertError;
    return NextResponse.json({ response });
  } catch (error) {
    if (
      error instanceof ConversationNotFoundError ||
      error instanceof ProviderConnectionNotFoundError
    ) {
      return NextResponse.json(
        {
          error: {
            code: "CONNECTION_NOT_FOUND",
            message: "Conversation or Gemini connection not found.",
          },
        },
        { status: 404 },
      );
    }
    const message =
      error instanceof Error && error.name === "AiProviderError"
        ? error.message
        : "Could not complete the AI request.";
    return NextResponse.json(
      { error: { code: "PROVIDER_ERROR", message } },
      { status: 500 },
    );
  }
}
