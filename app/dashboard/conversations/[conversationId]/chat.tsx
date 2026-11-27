"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ConversationMessage } from "@/types/conversation";

type DisplayMessage = Pick<ConversationMessage, "id" | "role" | "content">;

export function Chat({
  conversationId,
  initialMessages,
}: {
  conversationId: string;
  initialMessages: ConversationMessage[];
}) {
  const [message, setMessage] = useState("");
  const [provider, setProvider] = useState<"google" | "ollama">("google");
  const [messages, setMessages] = useState<DisplayMessage[]>(initialMessages);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function send() {
    const content = message.trim();
    if (content === "" || pending) return;
    const optimisticId = `pending-${crypto.randomUUID()}`;
    setMessages((current) => [
      ...current,
      { id: optimisticId, role: "user", content },
    ]);
    setMessage("");
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          conversationId,
          message: content,
          provider,
        }),
      });
      const payload = (await response.json()) as {
        response?: { content: string };
        error?: { message: string };
      };
      if (!response.ok)
        throw new Error(payload.error?.message ?? "Chat request failed.");
      setMessages((current) => [
        ...current,
        {
          id: `response-${crypto.randomUUID()}`,
          role: "assistant",
          content: payload.response?.content ?? "",
        },
      ]);
    } catch (caught) {
      setMessages((current) =>
        current.filter((item) => item.id !== optimisticId),
      );
      setMessage(content);
      setError(
        caught instanceof Error ? caught.message : "Chat request failed.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Single-model chat</h2>
      <label className="mt-4 block text-sm font-medium text-slate-700">
        Model route
        <select
          className="mt-2 block rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
          value={provider}
          onChange={(event) =>
            setProvider(event.target.value as "google" | "ollama")
          }
          aria-label="Chat model route"
        >
          <option value="google">Free API · Gemini</option>
          <option value="ollama">Local no-quota · Qwen3-Coder</option>
        </select>
      </label>
      <p className="mt-4 text-sm text-slate-500">
        {provider === "google"
          ? "Gemini free-tier quotas apply."
          : "Ollama must be running locally; usage is limited by your hardware, not an API quota."}
      </p>
      <div className="mt-4 space-y-3" aria-live="polite">
        {messages.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
            No messages yet. Ask the selected model a question to start this
            conversation.
          </p>
        ) : (
          messages.map((item) => (
            <article
              className={`rounded-xl p-4 text-sm leading-6 whitespace-pre-wrap ${item.role === "user" ? "bg-indigo-50 text-slate-900" : "bg-slate-50 text-slate-800"}`}
              key={item.id}
            >
              <p className="mb-1 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                {item.role === "user"
                  ? "You"
                  : provider === "ollama"
                    ? "Qwen3-Coder"
                    : "Gemini"}
              </p>
              {item.content}
            </article>
          ))
        )}
      </div>
      <textarea
        className="mt-4 min-h-28 w-full rounded-xl border border-slate-300 p-3 text-sm"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Ask Gemini…"
      />
      <Button
        className="mt-3"
        disabled={pending || message.trim() === ""}
        type="button"
        onClick={() => void send()}
      >
        {pending ? "Thinking…" : "Send"}
      </Button>
      {error ? (
        <p className="mt-3 text-sm text-red-700" aria-live="polite">
          {error}
        </p>
      ) : null}
    </section>
  );
}
