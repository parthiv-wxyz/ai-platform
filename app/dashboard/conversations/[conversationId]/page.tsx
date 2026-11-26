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

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  await connection();
  const { conversationId } = await params;
  const conversation = await loadConversation(conversationId);

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
          <p className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
            Messages will be added with the single-model chat milestone. This
            conversation is already protected by server ownership checks and
            database RLS.
          </p>
        </section>
      </div>
    </main>
  );
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
