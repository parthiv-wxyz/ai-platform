"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  initialAuthActionState,
  type AuthActionState,
} from "@/app/(auth)/auth-state";
import { Button } from "@/components/ui/button";

type AuthFormProps = {
  action: (
    previousState: AuthActionState,
    formData: FormData,
  ) => Promise<AuthActionState>;
  mode: "sign-in" | "sign-up";
};

export function AuthForm({ action, mode }: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    initialAuthActionState,
  );
  const isSignIn = mode === "sign-in";

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <label className="block text-sm font-medium text-slate-700">
        Email
        <input
          autoComplete="email"
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 ring-indigo-500 transition outline-none focus:ring-2"
          name="email"
          required
          type="email"
        />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Password
        <input
          autoComplete={isSignIn ? "current-password" : "new-password"}
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 ring-indigo-500 transition outline-none focus:ring-2"
          minLength={12}
          name="password"
          required
          type="password"
        />
      </label>
      <p className="text-xs text-slate-500">Use at least 12 characters.</p>
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
      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? "Please wait…" : isSignIn ? "Sign in" : "Create account"}
      </Button>
      <p className="text-center text-sm text-slate-600">
        {isSignIn ? "New to AI Council?" : "Already have an account?"}{" "}
        <Link
          className="font-medium text-indigo-700 hover:text-indigo-800"
          href={isSignIn ? "/sign-up" : "/sign-in"}
        >
          {isSignIn ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </form>
  );
}
