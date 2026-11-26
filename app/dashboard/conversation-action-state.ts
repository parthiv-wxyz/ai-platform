export type ConversationActionState = {
  message: string | null;
  status: "idle" | "error" | "success";
};

export const initialConversationActionState: ConversationActionState = {
  message: null,
  status: "idle",
};
