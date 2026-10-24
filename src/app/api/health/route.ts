import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  try {
    const db = getDb();
    // Run quick ping query to verify database connection health
    const result = db.prepare('SELECT 1 as ping;').get() as { ping: number };

    const latency = Date.now() - startTime;

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
          status: result?.ping === 1 ? 'connected' : 'degraded',
          engine: 'node:sqlite (WAL mode)',
          latencyMs: latency
        },
        environment: process.env.NODE_ENV || 'production'
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Database ping failure'
      },
      { status: 503 }
    );
  }
}
