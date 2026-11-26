import { describe, expect, it } from "vitest";
import { credentialsSchema } from "@/lib/validation/auth";

describe("credentialsSchema", () => {
  it("accepts a valid email and a sufficiently long password", () => {
    expect(
      credentialsSchema.safeParse({
        email: " member@example.com ",
        password: "long-enough-password",
      }),
    ).toMatchObject({ success: true });
  });

  it("rejects invalid email addresses and short passwords", () => {
    expect(
      credentialsSchema.safeParse({
        email: "not-an-email",
        password: "too-short",
      }).success,
    ).toBe(false);
  });
});
