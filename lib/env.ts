import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

const supabaseEnvSchema = z
  .object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  })
  .refine(
    (value) =>
      value.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY !== undefined ||
      value.NEXT_PUBLIC_SUPABASE_ANON_KEY !== undefined,
    {
      message:
        "Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      path: ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"],
    },
  );

export type AppEnv = z.infer<typeof envSchema>;
export type SupabaseEnv = z.infer<typeof supabaseEnvSchema> & {
  publishableKey: string;
};

export function getEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  return envSchema.parse(source);
}

export function getSupabaseEnv(
  source: NodeJS.ProcessEnv = process.env,
): SupabaseEnv {
  const value = supabaseEnvSchema.parse(source);
  const publishableKey =
    value.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    value.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (publishableKey === undefined) {
    throw new Error("Supabase publishable key is missing.");
  }

  return { ...value, publishableKey };
}

export function isSupabaseConfigured(
  source: NodeJS.ProcessEnv = process.env,
): boolean {
  return supabaseEnvSchema.safeParse(source).success;
}

export const env = getEnv();
