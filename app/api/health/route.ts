import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    name: 'cvforge',
    version: process.env.npm_package_version ?? '0.0.0',
    timestamp: new Date().toISOString(),
  });
}
