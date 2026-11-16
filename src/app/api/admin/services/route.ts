import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { updateServices } from '@/lib/db';

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updated = await updateServices(body);
    return NextResponse.json({ success: true, services: updated });
  } catch (error) {
    console.error('Failed to update services:', error);
    return NextResponse.json({ 
      error: 'Failed to update services',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
