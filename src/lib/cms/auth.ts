import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";
import type { CmsRole, CmsUser } from "./types";

export const ADMIN_SESSION_COOKIE = "dr_reham_admin_session";
export const ADMIN_PREVIEW_COOKIE = "dr_reham_admin_preview";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

function getSessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "dr-reham-cms-server-hmac-key-v1-local-preview-only"
  );
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split(":");
    if (parts.length !== 3 || parts[0] !== "scrypt") {
      return false;
    }
    const [, salt, hashHex] = parts;
    const expectedBuf = Buffer.from(hashHex, "hex");
    const actualBuf = scryptSync(password, salt, 64);
    if (expectedBuf.length !== actualBuf.length) {
      return false;
    }
    return timingSafeEqual(expectedBuf, actualBuf);
  } catch {
    return false;
  }
}

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: CmsRole;
  exp: number;
}

export function signSessionToken(user: CmsUser): string {
  const payload: SessionPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const base64Payload = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  );
  const signature = createHmac("sha256", getSessionSecret())
    .update(base64Payload)
    .digest("base64url");
  return `${base64Payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token || !token.includes(".")) {
    return null;
  }
  const [base64Payload, signature] = token.split(".");
  if (!base64Payload || !signature) {
    return null;
  }
  const expectedSig = createHmac("sha256", getSessionSecret())
    .update(base64Payload)
    .digest("base64url");

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(base64Payload, "base64url").toString("utf8")
    ) as SessionPayload;
    if (!decoded || typeof decoded.exp !== "number" || Date.now() > decoded.exp) {
      return null;
    }
    if (decoded.role !== "admin" && decoded.role !== "editor") {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export async function getSessionPayloadFromCookies(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    return verifySessionToken(raw);
  } catch {
    return null;
  }
}

export async function isProtectedPreviewEnabled(): Promise<boolean> {
  try {
    const session = await getSessionPayloadFromCookies();
    if (!session) {
      return false;
    }
    const cookieStore = await cookies();
    return cookieStore.get(ADMIN_PREVIEW_COOKIE)?.value === "1";
  } catch {
    return false;
  }
}

export function hashResetToken(rawToken: string): string {
  return createHmac("sha256", getSessionSecret())
    .update(rawToken)
    .digest("hex");
}
