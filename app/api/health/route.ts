// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { compose, withLogging } from '@/lib/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    database: boolean;
    databaseLatency?: number;
  };
  version?: string;
}

export const GET = compose(
  withLogging
)(async () => {
  const checks = {
    database: false,
    databaseLatency: 0,
  };

  try {
    // Check database connection con timeout
    const dbStart = Date.now();
    await Promise.race([
      prisma.$queryRaw`SELECT 1 as health`,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 5000)
      ),
    ]);
    
    checks.database = true;
    checks.databaseLatency = Date.now() - dbStart;
  } catch (error) {
    logger.warn('Health check: Database connection failed', { error });
    checks.database = false;
  }

  // Determinar status general
  const allHealthy = checks.database;
  const status: HealthCheck['status'] = allHealthy ? 'healthy' : 'unhealthy';

  const healthCheck: HealthCheck = {
    status,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
    version: process.env.npm_package_version || '0.1.0',
  };

  // Si no está healthy, log warning
  if (!allHealthy) {
    logger.warn('Health check failed', { checks });
  }

  return NextResponse.json(
    healthCheck,
    { 
      status: allHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
});