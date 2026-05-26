/**
 * Encrypts a plaintext string with the RSA-OAEP (SHA-256) public key configured in
 * NEXT_PUBLIC_RSA_PUBLIC_KEY (Base64-encoded SPKI/DER format).
 *
 * The backend decrypts the result with the matching PKCS#8 private key before
 * passing the password to ASP.NET Identity.
 */
export async function encryptPassword(plaintext: string): Promise<string> {
  const publicKeyBase64 = process.env.NEXT_PUBLIC_RSA_PUBLIC_KEY;
  if (!publicKeyBase64) {
    throw new Error("NEXT_PUBLIC_RSA_PUBLIC_KEY is not configured.");
  }

  const derBytes = Uint8Array.from(atob(publicKeyBase64), (c) =>
    c.charCodeAt(0)
  );

  const cryptoKey = await crypto.subtle.importKey(
    "spki",
    derBytes,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"]
  );

  const encoded = new TextEncoder().encode(plaintext);
  const encrypted = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    cryptoKey,
    encoded
  );

  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}
