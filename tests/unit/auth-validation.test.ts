import { describe, expect, it } from "vitest";
import { credentialsSchema } from "@/lib/validation/auth";

describe("credentialsSchema", () => {
  it("accepts a valid email and a four-character password", () => {
    expect(
      credentialsSchema.safeParse({
        email: " member@example.com ",
        password: "1234",
      }),
    ).toMatchObject({ success: true });
  });

  it("rejects invalid email addresses and short passwords", () => {
    expect(
      credentialsSchema.safeParse({
        email: "not-an-email",
        password: "123",
      }).success,
    ).toBe(false);
  });
});
