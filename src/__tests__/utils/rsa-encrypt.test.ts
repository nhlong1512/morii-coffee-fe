import { webcrypto } from "node:crypto";
import { TextEncoder as NodeTextEncoder } from "node:util";

// jsdom does not expose crypto.subtle or TextEncoder — polyfill with Node's native implementations.
Object.defineProperty(globalThis, "crypto", {
  value: webcrypto,
  writable: false,
});
if (typeof globalThis.TextEncoder === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).TextEncoder = NodeTextEncoder;
}

import { encryptPassword } from "@/utils/rsa-encrypt";

// RSA-2048 public key (SPKI base64) — matches the private key in appsettings.json
const TEST_PUBLIC_KEY_BASE64 =
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmk4Y0Bxe7RxPrWTwvBEZ" +
  "Ropfe2fzCLlJ5EPBcFwD+A/3IHO5/U3v5H0ymH9DUX/T+pGpyH41zVdlk0k63eOZ" +
  "3U/+ps8t03zn2wGyY7JKFOZ2YamyfpBbHVEvnXJS3fsQ+1y2HCmKpEBGj+/nUjUK" +
  "6wJIyRJb07dBNGrbNe76tiLC7+GEzuihj7mmOekGGX3o3XoMQ/zIg4HyY6FNbgap" +
  "leeAoowcg3YW9Fw/kncfgqVp48rkHUTnKH8XXU2EcLGLyYw+66gTBAxWLpyiYqbS" +
  "/qSthq2BV3CyGmf614Fx1aKMNsc2seLqX/jfoSIU91rvtxY2upaftrR0ObmQgxwB" +
  "dQIDAQAB";

beforeEach(() => {
  process.env.NEXT_PUBLIC_RSA_PUBLIC_KEY = TEST_PUBLIC_KEY_BASE64;
});

afterEach(() => {
  delete process.env.NEXT_PUBLIC_RSA_PUBLIC_KEY;
});

describe("encryptPassword", () => {
  it("returns a non-empty base64 string", async () => {
    const result = await encryptPassword("TestPassword1!");

    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
    // RSA-2048 produces 256 bytes → 344 base64 chars
    expect(result.length).toBe(344);
  });

  it("produces different ciphertext each call (OAEP is probabilistic)", async () => {
    const a = await encryptPassword("SamePassword1!");
    const b = await encryptPassword("SamePassword1!");

    expect(a).not.toBe(b);
  });

  it("encrypts different passwords to different ciphertexts", async () => {
    const a = await encryptPassword("PasswordOne1!");
    const b = await encryptPassword("PasswordTwo2@");

    expect(a).not.toBe(b);
  });

  it("output is valid base64", async () => {
    const result = await encryptPassword("ValidPass1!");

    expect(() => atob(result)).not.toThrow();
  });

  it("throws when NEXT_PUBLIC_RSA_PUBLIC_KEY is not set", async () => {
    delete process.env.NEXT_PUBLIC_RSA_PUBLIC_KEY;

    await expect(encryptPassword("any")).rejects.toThrow(
      "NEXT_PUBLIC_RSA_PUBLIC_KEY is not configured."
    );
  });
});
