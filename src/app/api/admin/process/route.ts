import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { updateProcessSteps } from '@/lib/db';

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updated = updateProcessSteps(body);
    return NextResponse.json({ success: true, processSteps: updated });
  } catch (error) {
    console.error('Failed to update process steps:', error);
    return NextResponse.json({ 
      error: 'Failed to update process steps',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
