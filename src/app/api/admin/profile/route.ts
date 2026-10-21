import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { updateProfile } from '@/lib/db';

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updated = updateProfile(body);
    return NextResponse.json({ success: true, profile: updated });
  } catch (error) {
    console.error('Failed to update profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
