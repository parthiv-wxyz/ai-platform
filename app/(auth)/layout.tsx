import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f7fb] p-5">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <Link
          className="text-lg font-semibold tracking-tight text-slate-950"
          href="/"
        >
          AI Council
        </Link>
        {children}
      </section>
    </main>
  );
}
