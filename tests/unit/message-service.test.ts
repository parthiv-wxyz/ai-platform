import type { User } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import {
  MessageAuthenticationRequiredError,
  MessageService,
  type MessageRepository,
} from "@/lib/db/messages";
import type { ConversationMessage } from "@/types/conversation";

const userA = { id: "11111111-1111-4111-8111-111111111111" } as User;
const userB = { id: "22222222-2222-4222-8222-222222222222" } as User;
const conversationId = "33333333-3333-4333-8333-333333333333";

class InMemoryMessageRepository implements MessageRepository {
  constructor(private readonly records: ConversationMessage[]) {}

  async listForUser(userId: string, requestedConversationId: string) {
    return this.records
      .filter(
        (message) =>
          message.userId === userId &&
          message.conversationId === requestedConversationId,
      )
      .sort((first, second) => first.createdAt.localeCompare(second.createdAt));
  }
}

const messages: ConversationMessage[] = [
  {
    id: "44444444-4444-4444-8444-444444444444",
    conversationId,
    userId: userA.id,
    role: "user",
    content: "Hello",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "55555555-5555-4555-8555-555555555555",
    conversationId,
    userId: userA.id,
    role: "assistant",
    content: "Hi there",
    createdAt: "2026-01-01T00:00:01.000Z",
  },
];

describe("MessageService", () => {
  it("loads persisted messages in chronological order", async () => {
    const service = new MessageService(
      { getUser: async () => userA },
      new InMemoryMessageRepository([...messages].reverse()),
    );

    await expect(service.list(conversationId)).resolves.toEqual(messages);
  });

  it("does not return another user's messages", async () => {
    const service = new MessageService(
      { getUser: async () => userB },
      new InMemoryMessageRepository(messages),
    );

    await expect(service.list(conversationId)).resolves.toEqual([]);
  });

  it("returns an empty list for an empty conversation", async () => {
    const service = new MessageService(
      { getUser: async () => userA },
      new InMemoryMessageRepository(messages),
    );

    await expect(
      service.list("66666666-6666-4666-8666-666666666666"),
    ).resolves.toEqual([]);
  });

  it("rejects unauthenticated retrieval", async () => {
    const service = new MessageService(
      { getUser: async () => null },
      new InMemoryMessageRepository(messages),
    );

    await expect(service.list(conversationId)).rejects.toBeInstanceOf(
      MessageAuthenticationRequiredError,
    );
  });
});
