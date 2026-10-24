import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { verifyAdminCredentials } from './db';

const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'portfolio-nextjs-super-secret-jwt-key-2026-secure'
);

const COOKIE_NAME = 'admin_session_token';

export async function createSessionToken(username: string = 'admin'): Promise<string> {
  return await new SignJWT({ role: 'admin', username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return false;
    return await verifySessionToken(token);
  } catch {
    return false;
  }
}

export function checkPassword(providedPassword: string, username?: string): boolean {
  const result = verifyAdminCredentials(providedPassword, username);
  return result.success;
}

export { COOKIE_NAME };
