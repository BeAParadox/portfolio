import { NextResponse } from 'next/server';
import { addInquiry } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    // Anti-spam rate limit: max 5 submissions per 10 minutes per IP
    const rateCheck = checkRateLimit(`inquiry:${ip}`, 5, 10 * 60);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `You have submitted multiple inquiries recently. Please wait a few minutes before submitting another brief.`
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, company, serviceType, budget, message } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Your name is required.' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return NextResponse.json({ error: 'Please share at least a few details about your project.' }, { status: 400 });
    }

    // Sanitize & enforce sane length bounds
    const cleanName = name.trim().slice(0, 100);
    const cleanEmail = email.trim().toLowerCase().slice(0, 100);
    const cleanCompany = (company ? String(company).trim() : '').slice(0, 100);
    const cleanService = (serviceType ? String(serviceType).trim() : 'General Inquiry').slice(0, 100);
    const cleanBudget = (budget ? String(budget).trim() : 'Flexible').slice(0, 100);
    const cleanMessage = message.trim().slice(0, 5000);

    const inquiry = addInquiry({
      name: cleanName,
      email: cleanEmail,
      company: cleanCompany,
      serviceType: cleanService,
      budget: cleanBudget,
      message: cleanMessage
    });

    return NextResponse.json({ success: true, inquiry }, { status: 201 });
  } catch (error) {
    console.error('Failed to save inquiry:', error);
    return NextResponse.json({ 
      error: 'Failed to process inquiry',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
