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
import { createProviderRegistry } from "@/lib/ai/providers/registry";
import { isOllamaAvailable } from "@/lib/ai/providers/ollama-provider";
import { chatInputSchema } from "@/lib/validation/provider";
import type { AiMessage } from "@/types/ai";
import { getProviderEnv } from "@/lib/env";
import { FreeModelEligibilityError } from "@/lib/ai/eligibility";
import { classifyCodingTask } from "@/lib/ai/tasks";
import { createExecutionPolicy } from "@/lib/ai/policy";
import { NoEligibleModelError, routeCodingTask } from "@/lib/ai/router";
import { AiProviderError, type ProviderId } from "@/types/ai";

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

    const task = {
      taskId: crypto.randomUUID(),
      taskType: input.taskType,
      input: input.message,
      language: input.language,
      framework: input.framework,
      sourceCode: input.sourceCode,
      errorLogs: input.errorLogs,
      repositoryContext: input.repositoryContext,
      constraints: { maxOutputTokens: input.maxOutputTokens },
    };
    const classification = classifyCodingTask(task);
    if (
      classification.needsClarification ||
      classification.taskType === "UNKNOWN"
    ) {
      return NextResponse.json(
        {
          error: {
            code: "TASK_CLARIFICATION_REQUIRED",
            message:
              "Select a coding task type or provide a clearer coding request.",
            classification,
          },
        },
        { status: 400 },
      );
    }
    const policy = createExecutionPolicy({
      maxOutputTokens: input.maxOutputTokens,
    });

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
    const taskContext = [
      input.message,
      input.language === undefined ? null : `Language: ${input.language}`,
      input.framework === undefined ? null : `Framework: ${input.framework}`,
      input.sourceCode === undefined
        ? null
        : `Source code:\n${input.sourceCode}`,
      input.errorLogs === undefined ? null : `Error logs:\n${input.errorLogs}`,
      input.repositoryContext === undefined
        ? null
        : `Repository context:\n${input.repositoryContext}`,
    ]
      .filter((value): value is string => value !== null)
      .join("\n\n");
    const messages = [
      ...(priorMessages as AiMessage[]),
      { role: "user" as const, content: taskContext },
    ];
    const googleCredential = await (async () => {
      try {
        return (
          await (
            await createProviderConnectionService()
          ).getCredentialForProvider("google")
        ).apiKey;
      } catch (error) {
        if (error instanceof ProviderConnectionNotFoundError) return null;
        throw error;
      }
    })();
    const ollamaBaseUrl = getProviderEnv().OLLAMA_BASE_URL;
    const availableProviders = new Set<ProviderId>();
    if (await isOllamaAvailable(ollamaBaseUrl)) {
      availableProviders.add("ollama");
    }
    if (googleCredential !== null) availableProviders.add("google");
    const decision = routeCodingTask({
      taskType: classification.taskType,
      availableProviders,
      preferredProvider: input.provider,
      preferredModel:
        input.model ??
        (input.provider === "ollama"
          ? getProviderEnv().OLLAMA_DEFAULT_MODEL
          : undefined),
      allowFreeProviderFallback: policy.allowFreeProviderFallback,
    });
    const credential =
      decision.provider === "google" ? googleCredential : ollamaBaseUrl;
    if (credential === null) throw new ProviderConnectionNotFoundError();
    const response = await createProviderRegistry({
      [decision.provider]: credential,
    })
      .get(decision.provider)
      .generate({
        model: decision.modelId,
        messages,
        maxOutputTokens: policy.maxOutputTokens,
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
    return NextResponse.json({
      response,
      routing: {
        taskType: classification.taskType,
        confidence: classification.confidence,
        provider: decision.provider,
        model: decision.modelId,
        reason: decision.reason,
        fallbackUsed: decision.fallbackUsed,
      },
    });
  } catch (error) {
    if (
      error instanceof ConversationNotFoundError ||
      error instanceof ProviderConnectionNotFoundError
    ) {
      return NextResponse.json(
        {
          error: {
            code: "CONNECTION_NOT_FOUND",
            message: "Conversation or provider connection not found.",
          },
        },
        { status: 404 },
      );
    }
    if (error instanceof FreeModelEligibilityError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: "Only explicitly verified free-tier models are available.",
          },
        },
        { status: 400 },
      );
    }
    if (error instanceof NoEligibleModelError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: 400 },
      );
    }
    if (error instanceof AiProviderError) {
      const message =
        error.code === "QUOTA_EXHAUSTED"
          ? "The provider's free-tier quota is exhausted. Try again after it resets."
          : error.message;
      return NextResponse.json(
        { error: { code: `PROVIDER_${error.code}`, message } },
        { status: error.code === "AUTHENTICATION_INVALID" ? 401 : 502 },
      );
    }
    const message = "Could not complete the AI request.";
    return NextResponse.json(
      { error: { code: "PROVIDER_ERROR", message } },
      { status: 500 },
    );
  }
}
