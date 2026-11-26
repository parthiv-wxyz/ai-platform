import { describe, expect, it } from "vitest";
import {
  decryptCredential,
  encryptCredential,
} from "@/lib/security/credentials";

const env = {
  AI_CREDENTIAL_ENCRYPTION_KEY: "a".repeat(64),
} as unknown as NodeJS.ProcessEnv;

describe("credential encryption", () => {
  it("round-trips credentials without plaintext ciphertext", () => {
    const encrypted = encryptCredential("AIza.fake-secret", env);
    expect(encrypted.ciphertext).not.toContain("AIza.fake-secret");
    expect(decryptCredential(encrypted, env)).toBe("AIza.fake-secret");
  });
  it("uses a different IV for each encryption", () => {
    expect(encryptCredential("same", env).iv).not.toBe(
      encryptCredential("same", env).iv,
    );
  });
  it("rejects tampering and missing configuration", () => {
    const encrypted = encryptCredential("secret", env);
    expect(() =>
      decryptCredential({ ...encrypted, ciphertext: "tampered" }, env),
    ).toThrow();
    expect(() => encryptCredential("secret", {} as NodeJS.ProcessEnv)).toThrow(
      "AI_CREDENTIAL_ENCRYPTION_KEY",
    );
  });
});
