export type Conversation = {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type ConversationMessage = {
  id: string;
  conversationId: string;
  userId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
};
