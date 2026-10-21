import { NextResponse } from 'next/server';
import { addInquiry } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, company, serviceType, budget, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 });
    }

    const inquiry = addInquiry({
      name,
      email,
      company: company || '',
      serviceType: serviceType || 'General Inquiry',
      budget: budget || 'Flexible',
      message
    });

    return NextResponse.json({ success: true, inquiry }, { status: 201 });
  } catch (error) {
    console.error('Failed to save inquiry:', error);
    return NextResponse.json({ error: 'Failed to process inquiry' }, { status: 500 });
  }
}
