"use server";

import { redirect } from "next/navigation";
import type { AuthActionState } from "@/app/(auth)/auth-state";
import { env } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { credentialsSchema } from "@/lib/validation/auth";

export async function signIn(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const credentials = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!credentials.success) {
    return {
      status: "error",
      message: credentials.error.issues[0]?.message ?? "Invalid credentials.",
    };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword(credentials.data);

    if (error !== null) {
      return { status: "error", message: "Invalid email or password." };
    }
  } catch {
    return {
      status: "error",
      message:
        "Authentication is unavailable. Check the Supabase configuration.",
    };
  }

  redirect("/dashboard");
}

export async function signUp(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const credentials = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!credentials.success) {
    return {
      status: "error",
      message: credentials.error.issues[0]?.message ?? "Invalid credentials.",
    };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signUp({
      ...credentials.data,
      options: {
        emailRedirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/confirm?next=/dashboard`,
      },
    });

    if (error !== null) {
      return {
        status: "error",
        message: "We could not create that account. Please try again.",
      };
    }
  } catch {
    return {
      status: "error",
      message:
        "Authentication is unavailable. Check the Supabase configuration.",
    };
  }

  return {
    status: "success",
    message: "Check your email to confirm your account, then sign in.",
  };
}

export async function signOut(): Promise<never> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}
