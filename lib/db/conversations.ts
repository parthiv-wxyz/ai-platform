import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  conversationIdSchema,
  createConversationSchema,
  updateConversationSchema,
} from "@/lib/validation/conversation";
import type { Conversation } from "@/types/conversation";

type ConversationRow = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export class AuthenticationRequiredError extends Error {
  constructor() {
    super("You must sign in to access conversations.");
    this.name = "AuthenticationRequiredError";
  }
}

export class ConversationNotFoundError extends Error {
  constructor() {
    super("Conversation not found.");
    this.name = "ConversationNotFoundError";
  }
}

export type ConversationRepository = {
  listForUser(userId: string): Promise<Conversation[]>;
  findForUser(
    userId: string,
    conversationId: string,
  ): Promise<Conversation | null>;
  createForUser(userId: string, title: string): Promise<Conversation>;
  updateForUser(
    userId: string,
    conversationId: string,
    title: string,
  ): Promise<Conversation | null>;
  deleteForUser(userId: string, conversationId: string): Promise<boolean>;
};

export type UserResolver = {
  getUser(): Promise<User | null>;
};

export class ConversationService {
  constructor(
    private readonly users: UserResolver,
    private readonly conversations: ConversationRepository,
  ) {}

  async list(): Promise<Conversation[]> {
    return this.conversations.listForUser((await this.currentUser()).id);
  }

  async find(conversationId: string): Promise<Conversation> {
    const conversation = await this.conversations.findForUser(
      (await this.currentUser()).id,
      conversationIdSchema.parse(conversationId),
    );

    if (conversation === null) {
      throw new ConversationNotFoundError();
    }

    return conversation;
  }

  async create(input: unknown): Promise<Conversation> {
    const { title } = createConversationSchema.parse(input);
    return this.conversations.createForUser(
      (await this.currentUser()).id,
      title,
    );
  }

  async update(conversationId: string, input: unknown): Promise<Conversation> {
    const { title } = updateConversationSchema.parse(input);
    const conversation = await this.conversations.updateForUser(
      (await this.currentUser()).id,
      conversationIdSchema.parse(conversationId),
      title,
    );

    if (conversation === null) {
      throw new ConversationNotFoundError();
    }

    return conversation;
  }

  async delete(conversationId: string): Promise<void> {
    const wasDeleted = await this.conversations.deleteForUser(
      (await this.currentUser()).id,
      conversationIdSchema.parse(conversationId),
    );

    if (!wasDeleted) {
      throw new ConversationNotFoundError();
    }
  }

  private async currentUser(): Promise<User> {
    const user = await this.users.getUser();
    if (user === null) {
      throw new AuthenticationRequiredError();
    }
    return user;
  }
}

class SupabaseConversationRepository implements ConversationRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listForUser(userId: string): Promise<Conversation[]> {
    const { data, error } = await this.supabase
      .from("conversations")
      .select("id, user_id, title, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error !== null) {
      throw error;
    }

    return (data as ConversationRow[]).map(toConversation);
  }

  async findForUser(
    userId: string,
    conversationId: string,
  ): Promise<Conversation | null> {
    const { data, error } = await this.supabase
      .from("conversations")
      .select("id, user_id, title, created_at, updated_at")
      .eq("id", conversationId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error !== null) {
      throw error;
    }

    return data === null ? null : toConversation(data as ConversationRow);
  }

  async createForUser(userId: string, title: string): Promise<Conversation> {
    const { data, error } = await this.supabase
      .from("conversations")
      .insert({ user_id: userId, title })
      .select("id, user_id, title, created_at, updated_at")
      .single();

    if (error !== null) {
      throw error;
    }

    return toConversation(data as ConversationRow);
  }

  async updateForUser(
    userId: string,
    conversationId: string,
    title: string,
  ): Promise<Conversation | null> {
    const { data, error } = await this.supabase
      .from("conversations")
      .update({ title })
      .eq("id", conversationId)
      .eq("user_id", userId)
      .select("id, user_id, title, created_at, updated_at")
      .maybeSingle();

    if (error !== null) {
      throw error;
    }

    return data === null ? null : toConversation(data as ConversationRow);
  }

  async deleteForUser(
    userId: string,
    conversationId: string,
  ): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId)
      .eq("user_id", userId)
      .select("id")
      .maybeSingle();

    if (error !== null) {
      throw error;
    }

    return data !== null;
  }
}

function toConversation(row: ConversationRow): Conversation {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createConversationService(): Promise<ConversationService> {
  const supabase = await createServerSupabaseClient();

  return new ConversationService(
    {
      async getUser() {
        const { data, error } = await supabase.auth.getUser();
        return error === null ? data.user : null;
      },
    },
    new SupabaseConversationRepository(supabase),
  );
}
