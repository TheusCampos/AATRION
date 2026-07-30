import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health
 * Endpoint público de verificação de saúde da aplicação (Health Check).
 * Utilizado por balanceadores de carga, Vercel, Render ou UptimeRobot.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'ATRION / CVForge API',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development',
    },
    { status: 200 }
  );
}
