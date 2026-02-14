import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "jam_session";

/**
 * Convert hex string to Uint8Array
 */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Convert Uint8Array to hex string
 */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Timing-safe comparison for Uint8Arrays
 */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

/**
 * Create HMAC-SHA256 signature using Web Crypto API
 */
async function createSignature(
  message: string,
  secret: string
): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, messageData);
  return bytesToHex(new Uint8Array(signature));
}

/**
 * Verify a signed session token (async version for middleware)
 */
async function verifySessionToken(token: string): Promise<boolean> {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    return false;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return false;
  }

  // Check expiration
  const expiresAt = parseInt(payload, 10);
  if (isNaN(expiresAt) || Date.now() > expiresAt) {
    return false;
  }

  // Verify signature using Web Crypto API
  const expectedSignature = await createSignature(payload, secret);

  const signatureBytes = hexToBytes(signature);
  const expectedSignatureBytes = hexToBytes(expectedSignature);

  return timingSafeEqual(signatureBytes, expectedSignatureBytes);
}

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  // Check if user is authenticated
  const isAuthenticated = sessionCookie
    ? await verifySessionToken(sessionCookie.value)
    : false;

  // Allow access if authenticated
  if (isAuthenticated) {
    return NextResponse.next();
  }

  // Redirect to PIN entry page if not authenticated
  const loginUrl = new URL("/", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/jam/:path*", "/discover/:path*"],
};
