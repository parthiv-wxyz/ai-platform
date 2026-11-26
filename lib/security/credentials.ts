import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { z } from "zod";

const VERSION = "v1";
const ALGORITHM = "aes-256-gcm";
const keySchema = z.string().regex(/^[0-9a-f]{64}$/i);

function encryptionKey(source: NodeJS.ProcessEnv = process.env): Buffer {
  const value = source.AI_CREDENTIAL_ENCRYPTION_KEY;
  const parsed = keySchema.safeParse(value);
  if (!parsed.success) {
    throw new Error("AI_CREDENTIAL_ENCRYPTION_KEY must be a 32-byte hex key.");
  }
  return Buffer.from(parsed.data, "hex");
}

export type EncryptedCredential = {
  version: string;
  ciphertext: string;
  iv: string;
  authTag: string;
};

export function encryptCredential(
  plaintext: string,
  source?: NodeJS.ProcessEnv,
): EncryptedCredential {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, encryptionKey(source), iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  return {
    version: VERSION,
    ciphertext: ciphertext.toString("base64url"),
    iv: iv.toString("base64url"),
    authTag: cipher.getAuthTag().toString("base64url"),
  };
}

export function decryptCredential(
  encrypted: EncryptedCredential,
  source?: NodeJS.ProcessEnv,
): string {
  if (encrypted.version !== VERSION) {
    throw new Error("Unsupported credential encryption version.");
  }
  const decipher = createDecipheriv(
    ALGORITHM,
    encryptionKey(source),
    Buffer.from(encrypted.iv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(encrypted.authTag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encrypted.ciphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
