import { type NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const safeNextPath = (value: string | null): string =>
  value !== null && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/dashboard";

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));

  if (tokenHash === null || type !== "signup") {
    return NextResponse.redirect(
      new URL("/sign-in?error=confirmation", request.url),
    );
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  return NextResponse.redirect(
    new URL(error === null ? next : "/sign-in?error=confirmation", request.url),
  );
}
