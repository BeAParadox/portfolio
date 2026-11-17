import { NextResponse } from 'next/server';
import { isMongoConfigured, getMongoDb, ensureMongoInitialized } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  const usingMongo = isMongoConfigured();

  try {
    if (usingMongo) {
      await ensureMongoInitialized();
      const db = await getMongoDb();
      const pingResult = await db.command({ ping: 1 });
      const latency = Date.now() - startTime;

      return NextResponse.json(
        {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          database: {
            status: pingResult.ok === 1 ? 'connected' : 'degraded',
            engine: 'MongoDB Atlas (NoSQL Connection Pool)',
            storageMode: 'cloud persistent (24/7 MongoDB Cluster)',
            databaseName: db.databaseName,
            latencyMs: latency
          },
          environment: process.env.NODE_ENV || 'production'
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
          status: 'standby',
          engine: 'MongoDB Atlas',
          storageMode: 'in-memory (awaiting MONGODB_URI in Vercel settings)',
          message: 'Set MONGODB_URI in Vercel Environment Variables to connect your MongoDB Atlas cluster.'
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
        engine: 'MongoDB Atlas',
        error: error instanceof Error ? error.message : 'Database ping failure'
      },
      { status: 503 }
    );
  }
}
