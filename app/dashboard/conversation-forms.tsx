"use client";

import { useActionState } from "react";
import {
  initialConversationActionState,
  type ConversationActionState,
} from "@/app/dashboard/conversation-action-state";
import { Button } from "@/components/ui/button";

type CreateConversationFormProps = {
  action: (
    previousState: ConversationActionState,
    formData: FormData,
  ) => Promise<ConversationActionState>;
};

export function CreateConversationForm({
  action,
}: CreateConversationFormProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    initialConversationActionState,
  );

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-3 sm:flex-row">
      <input
        className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm ring-indigo-500 transition outline-none focus:ring-2"
        defaultValue="New conversation"
        maxLength={200}
        name="title"
        required
      />
      <Button disabled={isPending} type="submit">
        {isPending ? "Creating…" : "Create conversation"}
      </Button>
      {state.message !== null ? (
        <p
          aria-live="polite"
          className={
            state.status === "error"
              ? "text-sm text-red-700"
              : "text-sm text-emerald-700"
          }
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function RenameConversationForm({
  action,
  initialTitle,
}: {
  action: (
    previousState: ConversationActionState,
    formData: FormData,
  ) => Promise<ConversationActionState>;
  initialTitle: string;
}) {
  const [state, formAction, isPending] = useActionState(
    action,
    initialConversationActionState,
  );

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-3 sm:flex-row">
      <input
        className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm ring-indigo-500 transition outline-none focus:ring-2"
        defaultValue={initialTitle}
        maxLength={200}
        name="title"
        required
      />
      <Button disabled={isPending} type="submit">
        {isPending ? "Saving…" : "Rename"}
      </Button>
      {state.message !== null ? (
        <p
          aria-live="polite"
          className={
            state.status === "error"
              ? "text-sm text-red-700"
              : "text-sm text-emerald-700"
          }
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
