import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const db = getDatabase();
    // Return public portfolio elements (excluding private inquiries)
    return NextResponse.json({
      profile: db.profile,
      projects: db.projects,
      services: db.services,
      processSteps: db.processSteps,
      testimonials: db.testimonials
    });
  } catch (error) {
    console.error('Failed to get portfolio data:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio data' }, { status: 500 });
  }
}
