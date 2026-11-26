import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  decryptCredential,
  encryptCredential,
  type EncryptedCredential,
} from "@/lib/security/credentials";
import {
  connectionIdSchema,
  providerConnectionInputSchema,
} from "@/lib/validation/provider";

export type ProviderConnection = {
  id: string;
  provider: "google";
  label: string;
  status: "active" | "invalid" | "revoked";
  createdAt: string;
};

type ConnectionRow = {
  id: string;
  provider: "google";
  label: string;
  status: ProviderConnection["status"];
  created_at: string;
  credential_ciphertext: string;
  credential_iv: string;
  credential_auth_tag: string;
  credential_version: string;
};

export class ProviderAuthenticationRequiredError extends Error {}
export class ProviderConnectionNotFoundError extends Error {}

export type ProviderConnectionRepository = {
  listForUser(userId: string): Promise<ProviderConnection[]>;
  findForUser(userId: string, id: string): Promise<ConnectionRow | null>;
  insertForUser(
    userId: string,
    value: Omit<ConnectionRow, "id" | "created_at">,
  ): Promise<ProviderConnection>;
  deleteForUser(userId: string, id: string): Promise<boolean>;
};

export class ProviderConnectionService {
  constructor(
    private readonly users: { getUser(): Promise<User | null> },
    private readonly repository: ProviderConnectionRepository,
  ) {}

  async list(): Promise<ProviderConnection[]> {
    return this.repository.listForUser((await this.currentUser()).id);
  }

  async connect(input: unknown): Promise<ProviderConnection> {
    const value = providerConnectionInputSchema.parse(input);
    const encrypted = encryptCredential(value.apiKey);
    return this.repository.insertForUser((await this.currentUser()).id, {
      provider: value.provider,
      label: value.label,
      status: "active",
      credential_ciphertext: encrypted.ciphertext,
      credential_iv: encrypted.iv,
      credential_auth_tag: encrypted.authTag,
      credential_version: encrypted.version,
    });
  }

  async getCredential(
    id: string,
  ): Promise<{ provider: "google"; apiKey: string }> {
    const row = await this.repository.findForUser(
      (await this.currentUser()).id,
      connectionIdSchema.parse(id),
    );
    if (row === null) throw new ProviderConnectionNotFoundError();
    const encrypted: EncryptedCredential = {
      version: row.credential_version,
      ciphertext: row.credential_ciphertext,
      iv: row.credential_iv,
      authTag: row.credential_auth_tag,
    };
    return { provider: row.provider, apiKey: decryptCredential(encrypted) };
  }

  async getCredentialFromAnyOwnedGoogleConnection(): Promise<{
    provider: "google";
    apiKey: string;
  }> {
    const rows = await this.repository.listForUser(
      (await this.currentUser()).id,
    );
    const connection = rows[0];
    if (connection === undefined) throw new ProviderConnectionNotFoundError();
    return this.getCredential(connection.id);
  }

  async disconnect(id: string): Promise<void> {
    const deleted = await this.repository.deleteForUser(
      (await this.currentUser()).id,
      connectionIdSchema.parse(id),
    );
    if (!deleted) throw new ProviderConnectionNotFoundError();
  }

  private async currentUser(): Promise<User> {
    const user = await this.users.getUser();
    if (user === null) throw new ProviderAuthenticationRequiredError();
    return user;
  }
}

class SupabaseProviderConnectionRepository implements ProviderConnectionRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listForUser(userId: string): Promise<ProviderConnection[]> {
    const { data, error } = await this.supabase
      .from("provider_connections")
      .select("id, provider, label, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error !== null) throw error;
    return (
      data as Array<{
        id: string;
        provider: "google";
        label: string;
        status: ProviderConnection["status"];
        created_at: string;
      }>
    ).map((row) => ({
      id: row.id,
      provider: row.provider,
      label: row.label,
      status: row.status,
      createdAt: row.created_at,
    }));
  }

  async findForUser(userId: string, id: string): Promise<ConnectionRow | null> {
    const { data, error } = await this.supabase
      .from("provider_connections")
      .select(
        "id, provider, label, status, created_at, credential_ciphertext, credential_iv, credential_auth_tag, credential_version",
      )
      .eq("user_id", userId)
      .eq("id", id)
      .maybeSingle();
    if (error !== null) throw error;
    return data as ConnectionRow | null;
  }

  async insertForUser(
    userId: string,
    value: Omit<ConnectionRow, "id" | "created_at">,
  ): Promise<ProviderConnection> {
    const { data, error } = await this.supabase
      .from("provider_connections")
      .insert({ user_id: userId, ...value })
      .select("id, provider, label, status, created_at")
      .single();
    if (error !== null) throw error;
    const row = data as {
      id: string;
      provider: "google";
      label: string;
      status: ProviderConnection["status"];
      created_at: string;
    };
    return {
      id: row.id,
      provider: row.provider,
      label: row.label,
      status: row.status,
      createdAt: row.created_at,
    };
  }

  async deleteForUser(userId: string, id: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("provider_connections")
      .delete()
      .eq("user_id", userId)
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error !== null) throw error;
    return data !== null;
  }
}

export async function createProviderConnectionService(): Promise<ProviderConnectionService> {
  const supabase = await createServerSupabaseClient();
  return new ProviderConnectionService(
    { getUser: async () => (await supabase.auth.getUser()).data.user },
    new SupabaseProviderConnectionRepository(createAdminSupabaseClient()),
  );
}
