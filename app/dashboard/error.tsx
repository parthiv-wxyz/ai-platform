"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard failed to load", error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f7fb] p-5">
      <section className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">
          We could not load your workspace.
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Your data was not changed. Check your connection and try again.
        </p>
        <div className="mt-6 flex gap-3">
          <Button onClick={reset} type="button">
            Try again
          </Button>
          <Link
            className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
            href="/"
          >
            Home
          </Link>
        </div>
      </section>
    </main>
  );
}
