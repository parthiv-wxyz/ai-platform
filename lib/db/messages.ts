import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { conversationIdSchema } from "@/lib/validation/conversation";
import type { ConversationMessage } from "@/types/conversation";

type MessageRow = {
  id: string;
  conversation_id: string;
  user_id: string;
  role: ConversationMessage["role"];
  content: string;
  created_at: string;
};

export class MessageAuthenticationRequiredError extends Error {
  constructor() {
    super("You must sign in to access messages.");
    this.name = "MessageAuthenticationRequiredError";
  }
}

export type MessageRepository = {
  listForUser(
    userId: string,
    conversationId: string,
  ): Promise<ConversationMessage[]>;
};

export class MessageService {
  constructor(
    private readonly users: { getUser(): Promise<User | null> },
    private readonly messages: MessageRepository,
  ) {}

  async list(conversationId: string): Promise<ConversationMessage[]> {
    return this.messages.listForUser(
      (await this.currentUser()).id,
      conversationIdSchema.parse(conversationId),
    );
  }

  private async currentUser(): Promise<User> {
    const user = await this.users.getUser();
    if (user === null) throw new MessageAuthenticationRequiredError();
    return user;
  }
}

class SupabaseMessageRepository implements MessageRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listForUser(
    userId: string,
    conversationId: string,
  ): Promise<ConversationMessage[]> {
    const { data, error } = await this.supabase
      .from("messages")
      .select("id, conversation_id, user_id, role, content, created_at")
      .eq("conversation_id", conversationId)
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });

    if (error !== null) throw error;
    return (data as MessageRow[]).map((row) => ({
      id: row.id,
      conversationId: row.conversation_id,
      userId: row.user_id,
      role: row.role,
      content: row.content,
      createdAt: row.created_at,
    }));
  }
}

export async function createMessageService(): Promise<MessageService> {
  const supabase = await createServerSupabaseClient();
  return new MessageService(
    { getUser: async () => (await supabase.auth.getUser()).data.user },
    new SupabaseMessageRepository(supabase),
  );
}
