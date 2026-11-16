import { NextResponse } from 'next/server';
import { getDb, resolveDatabasePath, isMySqlConfigured } from '@/lib/db';
import { getMySqlPool, ensureMySqlInitialized } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  const usingMySql = isMySqlConfigured();

  try {
    if (usingMySql) {
      await ensureMySqlInitialized();
      const pool = getMySqlPool();
      const [rows]: any = await pool.execute('SELECT 1 as ping;');
      const latency = Date.now() - startTime;

      return NextResponse.json(
        {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          database: {
            status: rows?.[0]?.ping === 1 ? 'connected' : 'degraded',
            engine: 'MySQL (mysql2 connection pool)',
            storageMode: 'cloud persistent (24/7 relational database)',
            latencyMs: latency
          },
          environment: process.env.NODE_ENV || 'production'
        },
        { status: 200 }
      );
    }

    // SQLite fallback mode
    const db = getDb();
    const { isServerless } = resolveDatabasePath();
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
          storageMode: isServerless ? 'serverless-ephemeral (/tmp)' : 'persistent (local disk)',
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
        engine: usingMySql ? 'MySQL' : 'node:sqlite',
        error: error instanceof Error ? error.message : 'Database ping failure'
      },
      { status: 503 }
    );
  }
}
