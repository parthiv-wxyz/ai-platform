"use server";

import { revalidatePath } from "next/cache";
import type { ConversationActionState } from "@/app/dashboard/conversation-action-state";
import { createConversationService } from "@/lib/db/conversations";

export async function createConversation(
  _previousState: ConversationActionState,
  formData: FormData,
): Promise<ConversationActionState> {
  try {
    const service = await createConversationService();
    await service.create({ title: formData.get("title") });
    revalidatePath("/dashboard");
    return { status: "success", message: "Conversation created." };
  } catch {
    return {
      status: "error",
      message: "We could not create that conversation. Please try again.",
    };
  }
}

export async function renameConversation(
  conversationId: string,
  _previousState: ConversationActionState,
  formData: FormData,
): Promise<ConversationActionState> {
  try {
    const service = await createConversationService();
    await service.update(conversationId, { title: formData.get("title") });
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/conversations/${conversationId}`);
    return { status: "success", message: "Conversation renamed." };
  } catch {
    return {
      status: "error",
      message: "We could not rename that conversation. Please try again.",
    };
  }
}

export async function deleteConversation(
  conversationId: string,
): Promise<void> {
  const service = await createConversationService();
  await service.delete(conversationId);
  revalidatePath("/dashboard");
}
