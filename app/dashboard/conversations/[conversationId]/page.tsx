import Link from "next/link";
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import { RenameConversationForm } from "@/app/dashboard/conversation-forms";
import { renameConversation } from "@/app/dashboard/actions";
import {
  AuthenticationRequiredError,
  ConversationNotFoundError,
  createConversationService,
} from "@/lib/db/conversations";
import { Chat } from "@/app/dashboard/conversations/[conversationId]/chat";
import { createMessageService } from "@/lib/db/messages";

// This page loads request-scoped authenticated conversation data on the server.
export const instant = false;

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  await connection();
  const { conversationId } = await params;
  const conversation = await loadConversation(conversationId);
  const messages = await loadMessages(conversation.id);

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <Link
          className="text-sm font-medium text-indigo-700 hover:text-indigo-800"
          href="/dashboard"
        >
          ← All conversations
        </Link>
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-medium text-indigo-600">
            Conversation settings
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {conversation.title}
          </h1>
          <RenameConversationForm
            action={renameConversation.bind(null, conversation.id)}
            initialTitle={conversation.title}
          />
          <Chat
            key={conversation.id}
            conversationId={conversation.id}
            initialMessages={messages}
          />
        </section>
      </div>
    </main>
  );
}

async function loadMessages(conversationId: string) {
  const service = await createMessageService();
  return service.list(conversationId);
}

async function loadConversation(conversationId: string) {
  try {
    const service = await createConversationService();
    return await service.find(conversationId);
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      redirect("/sign-in");
    }
    if (error instanceof ConversationNotFoundError) {
      notFound();
    }
    throw error;
  }
}
