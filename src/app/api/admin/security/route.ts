import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { updateAdminCredentials } from '@/lib/db';

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { currentPassword, newPassword, newUsername } = body;

    if (!currentPassword) {
      return NextResponse.json(
        { error: 'Current password is required to make security changes.' },
        { status: 400 }
      );
    }

    if (!newPassword && !newUsername) {
      return NextResponse.json(
        { error: 'Please provide a new password or a new username.' },
        { status: 400 }
      );
    }

    const result = updateAdminCredentials(currentPassword, newPassword, newUsername);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Admin security credentials updated successfully in SQLite database.'
    });
  } catch (error) {
    console.error('Failed to update admin security:', error);
    return NextResponse.json({ error: 'Failed to update credentials' }, { status: 500 });
  }
}
