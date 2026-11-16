import { NextResponse } from 'next/server';
import { createSessionToken, COOKIE_NAME } from '@/lib/auth';
import { verifyAdminCredentials } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    // Rate limit: 5 failed attempts per 15 minutes per IP
    const rateCheck = checkRateLimit(`login:${ip}`, 5, 15 * 60);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many login attempts. Please wait ${Math.ceil(
            rateCheck.retryAfterSeconds / 60
          )} minutes before trying again.`
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rateCheck.retryAfterSeconds) }
        }
      );
    }

    const { username, password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const verification = await verifyAdminCredentials(password, username);
    if (!verification.success) {
      return NextResponse.json(
        { error: verification.error || 'Incorrect administrator password' },
        { status: 401 }
      );
    }

    const token = await createSessionToken(verification.username || 'admin');
    const response = NextResponse.json({
      success: true,
      message: 'Authenticated successfully',
      username: verification.username
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
