import Link from "next/link";
import { ProviderManager } from "@/app/dashboard/providers/provider-manager";

export default async function ProvidersPage() {
  return (
    <main className="min-h-screen bg-[#f5f7fb] px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <Link className="text-sm font-medium text-indigo-700" href="/dashboard">
          ← Dashboard
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          Provider connections
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Connect your own Gemini API key. It is encrypted server-side and never
          shown again.
        </p>
        <ProviderManager />
      </div>
    </main>
  );
}
