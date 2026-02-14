import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const SESSION_COOKIE_NAME = "jam_session";
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

/**
 * Verify if the provided PIN matches the configured JAM_PIN
 */
export function verifyPin(pin: string): boolean {
  const correctPin = process.env.JAM_PIN;

  if (!correctPin) {
    throw new Error("JAM_PIN environment variable is not set");
  }

  // Use timing-safe comparison to prevent timing attacks
  const pinBuffer = Buffer.from(pin);
  const correctPinBuffer = Buffer.from(correctPin);

  if (pinBuffer.length !== correctPinBuffer.length) {
    return false;
  }

  return timingSafeEqual(pinBuffer, correctPinBuffer);
}

/**
 * Create a signed session token
 */
function createSessionToken(): string {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is not set");
  }

  const expiresAt = Date.now() + SESSION_DURATION;
  const payload = `${expiresAt}`;
  const signature = createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return `${payload}.${signature}`;
}

/**
 * Verify a signed session token
 */
function verifySessionToken(token: string): boolean {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is not set");
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

  // Verify signature
  const expectedSignature = createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedSignatureBuffer.length) {
    return false;
  }

  return timingSafeEqual(signatureBuffer, expectedSignatureBuffer);
}

/**
 * Set the session cookie (call this after successful PIN verification)
 */
export async function setSessionCookie() {
  const token = createSessionToken();
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000, // maxAge is in seconds
    path: "/",
  });
}

/**
 * Check if the current request has a valid session
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie) {
    return false;
  }

  return verifySessionToken(sessionCookie.value);
}

/**
 * Clear the session cookie (logout)
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
