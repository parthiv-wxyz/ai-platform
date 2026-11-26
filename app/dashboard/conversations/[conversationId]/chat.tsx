"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Chat({ conversationId }: { conversationId: string }) {
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function send() {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ conversationId, message }),
      });
      const payload = (await response.json()) as {
        response?: { content: string };
        error?: { message: string };
      };
      if (!response.ok)
        throw new Error(payload.error?.message ?? "Chat request failed.");
      setAnswer(payload.response?.content ?? "");
      setMessage("");
    } catch (caught) {
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
      {answer ? (
        <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 whitespace-pre-wrap">
          {answer}
        </p>
      ) : null}
      {error ? (
        <p className="mt-3 text-sm text-red-700" aria-live="polite">
          {error}
        </p>
      ) : null}
    </section>
  );
}
