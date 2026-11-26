export type AuthActionState = {
  message: string | null;
  status: "idle" | "error" | "success";
};

export const initialAuthActionState: AuthActionState = {
  message: null,
  status: "idle",
};
