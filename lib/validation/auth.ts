import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(12, "Use a password with at least 12 characters."),
});
