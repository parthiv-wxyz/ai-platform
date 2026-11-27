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

const providerEnvSchema = z.object({
  AI_CREDENTIAL_ENCRYPTION_KEY: z.string().regex(/^[0-9a-f]{64}$/i),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  GEMINI_DEFAULT_MODEL: z.string().min(1).default("gemini-3.5-flash-lite"),
  AI_PROVIDER_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .positive()
    .max(120_000)
    .default(30_000),
});

export type AppEnv = z.infer<typeof envSchema>;
export type SupabaseEnv = z.infer<typeof supabaseEnvSchema> & {
  publishableKey: string;
};
export type ProviderEnv = z.infer<typeof providerEnvSchema>;

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

export function getProviderEnv(
  source: NodeJS.ProcessEnv = process.env,
): ProviderEnv {
  return providerEnvSchema.parse(source);
}

export const env = getEnv();
