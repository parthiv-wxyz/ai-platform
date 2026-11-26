"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Connection = {
  id: string;
  provider: string;
  label: string;
  status: string;
};

export function ProviderManager() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [label, setLabel] = useState("Personal Gemini key");
  const [apiKey, setApiKey] = useState("");
  const [message, setMessage] = useState("");
  const load = async () => {
    const response = await fetch("/api/providers");
    if (response.ok)
      setConnections(
        ((await response.json()) as { connections: Connection[] }).connections,
      );
  };
  useEffect(() => {
    let active = true;
    void fetch("/api/providers")
      .then(async (response) =>
        response.ok
          ? ((await response.json()) as { connections: Connection[] })
          : { connections: [] },
      )
      .then((payload) => {
        if (active) setConnections(payload.connections);
      });
    return () => {
      active = false;
    };
  }, []);
  async function connect() {
    const response = await fetch("/api/providers", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ provider: "google", label, apiKey }),
    });
    setApiKey("");
    setMessage(
      response.ok
        ? "Gemini connected. The key will not be displayed again."
        : "Could not connect that key.",
    );
    if (response.ok) await load();
  }
  async function disconnect(id: string) {
    await fetch(`/api/providers/${id}`, { method: "DELETE" });
    await load();
  }
  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          className="flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          aria-label="Connection label"
        />
        <input
          className="flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
          type="password"
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          placeholder="Gemini API key"
          aria-label="Gemini API key"
        />
        <Button
          type="button"
          onClick={() => void connect()}
          disabled={apiKey.length < 20}
        >
          Connect
        </Button>
      </div>
      {message ? (
        <p className="mt-3 text-sm text-slate-600" aria-live="polite">
          {message}
        </p>
      ) : null}
      <ul className="mt-6 space-y-3">
        {connections.map((connection) => (
          <li
            className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm"
            key={connection.id}
          >
            <span>
              {connection.label} · {connection.provider} · {connection.status}
            </span>
            <button
              className="text-red-700"
              type="button"
              onClick={() => void disconnect(connection.id)}
            >
              Disconnect
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
