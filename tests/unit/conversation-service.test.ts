import type { User } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import {
  AuthenticationRequiredError,
  ConversationNotFoundError,
  ConversationService,
  type ConversationRepository,
  type UserResolver,
} from "@/lib/db/conversations";
import type { Conversation } from "@/types/conversation";

const userA = { id: "11111111-1111-4111-8111-111111111111" } as User;
const userB = { id: "22222222-2222-4222-8222-222222222222" } as User;

class InMemoryConversationRepository implements ConversationRepository {
  private readonly records = new Map<string, Conversation>();

  async listForUser(userId: string): Promise<Conversation[]> {
    return [...this.records.values()].filter(
      (conversation) => conversation.userId === userId,
    );
  }

  async findForUser(
    userId: string,
    conversationId: string,
  ): Promise<Conversation | null> {
    const conversation = this.records.get(conversationId);
    return conversation?.userId === userId ? conversation : null;
  }

  async createForUser(userId: string, title: string): Promise<Conversation> {
    const conversation = {
      id: "33333333-3333-4333-8333-333333333333",
      userId,
      title,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    this.records.set(conversation.id, conversation);
    return conversation;
  }

  async updateForUser(
    userId: string,
    conversationId: string,
    title: string,
  ): Promise<Conversation | null> {
    const conversation = await this.findForUser(userId, conversationId);
    if (conversation === null) {
      return null;
    }
    const updated = { ...conversation, title };
    this.records.set(updated.id, updated);
    return updated;
  }

  async deleteForUser(
    userId: string,
    conversationId: string,
  ): Promise<boolean> {
    const conversation = await this.findForUser(userId, conversationId);
    if (conversation === null) {
      return false;
    }
    this.records.delete(conversationId);
    return true;
  }
}

const users = (user: User | null): UserResolver => ({
  async getUser() {
    return user;
  },
});

describe("ConversationService", () => {
  it("rejects unauthenticated access", async () => {
    const service = new ConversationService(
      users(null),
      new InMemoryConversationRepository(),
    );

    await expect(service.list()).rejects.toBeInstanceOf(
      AuthenticationRequiredError,
    );
  });

  it("derives ownership from the authenticated user and rejects a client userId", async () => {
    const repository = new InMemoryConversationRepository();
    const service = new ConversationService(users(userA), repository);

    await expect(
      service.create({ title: "Security review", userId: userB.id }),
    ).rejects.toThrow();

    const conversation = await service.create({ title: "Security review" });

    expect(conversation.userId).toBe(userA.id);
    expect(conversation.title).toBe("Security review");
  });

  it("prevents a second user from reading, changing, or deleting another user's conversation", async () => {
    const repository = new InMemoryConversationRepository();
    const owner = new ConversationService(users(userA), repository);
    const otherUser = new ConversationService(users(userB), repository);
    const conversation = await owner.create({ title: "Private" });

    await expect(otherUser.find(conversation.id)).rejects.toBeInstanceOf(
      ConversationNotFoundError,
    );
    await expect(
      otherUser.update(conversation.id, { title: "Stolen" }),
    ).rejects.toBeInstanceOf(ConversationNotFoundError);
    await expect(otherUser.delete(conversation.id)).rejects.toBeInstanceOf(
      ConversationNotFoundError,
    );
    await expect(owner.find(conversation.id)).resolves.toMatchObject({
      title: "Private",
      userId: userA.id,
    });
  });
});
