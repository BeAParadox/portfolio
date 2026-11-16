import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getInquiries, deleteInquiry } from '@/lib/db';

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const inquiries = await getInquiries();
    return NextResponse.json({ inquiries });
  } catch (error) {
    console.error('Failed to get inquiries:', error);
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Inquiry ID is required' }, { status: 400 });
    }
    const success = await deleteInquiry(id);
    if (!success) {
      return NextResponse.json({ error: 'Inquiry not found or already deleted' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete inquiry:', error);
    return NextResponse.json({ 
      error: 'Failed to delete inquiry',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
