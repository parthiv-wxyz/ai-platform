import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { signOut } from "@/app/(auth)/actions";
import { CreateConversationForm } from "@/app/dashboard/conversation-forms";
import {
  createConversation,
  deleteConversation,
} from "@/app/dashboard/actions";
import {
  AuthenticationRequiredError,
  createConversationService,
} from "@/lib/db/conversations";
import { isSupabaseConfigured } from "@/lib/env";

export default async function DashboardPage() {
  await connection();

  if (!isSupabaseConfigured()) {
    return <SetupRequired />;
  }

  const conversations = await loadConversations();

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-indigo-600">
              Private workspace
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Conversations
            </h1>
          </div>
          <form action={signOut}>
            <button
              className="text-sm font-medium text-slate-600 hover:text-slate-950"
              type="submit"
            >
              Sign out
            </button>
          </form>
          <Link
            className="text-sm font-medium text-indigo-700"
            href="/dashboard/providers"
          >
            Providers
          </Link>
        </header>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold">Start a conversation</h2>
          <CreateConversationForm action={createConversation} />
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Your conversations</h2>
          {conversations.length === 0 ? (
            <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-sm leading-6 text-slate-600">
              No conversations yet. Create one above to begin your private
              workspace.
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {conversations.map((conversation) => (
                <li
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  key={conversation.id}
                >
                  <Link
                    className="min-w-0 flex-1 truncate font-medium text-slate-950 hover:text-indigo-700"
                    href={`/dashboard/conversations/${conversation.id}`}
                  >
                    {conversation.title}
                  </Link>
                  <form action={deleteConversation.bind(null, conversation.id)}>
                    <button
                      className="text-sm font-medium text-red-700 hover:text-red-800"
                      type="submit"
                    >
                      Delete
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

async function loadConversations() {
  try {
    const service = await createConversationService();
    return await service.list();
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      redirect("/sign-in");
    }
    throw error;
  }
}

function SetupRequired() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f7fb] p-5">
      <section className="max-w-lg rounded-3xl border border-amber-200 bg-amber-50 p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">Supabase setup required</h1>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          Add the project URL and publishable key to <code>.env.local</code>,
          then apply the migration in <code>supabase/migrations</code>.
        </p>
        <Link
          className="mt-6 inline-block text-sm font-medium text-indigo-700 hover:text-indigo-800"
          href="/"
        >
          Return home
        </Link>
      </section>
    </main>
  );
}
