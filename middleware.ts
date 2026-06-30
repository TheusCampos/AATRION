import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/register(.*)',
  '/pricing(.*)',
  '/api/webhooks(.*)',
]);

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 100;
const WINDOW_MS = 60 * 1000;

export default clerkMiddleware((auth, req) => {
  const ip = req.headers.get('x-forwarded-for') ?? req.ip ?? '127.0.0.1';
  const now = Date.now();
  const rateData = rateLimitMap.get(ip);

  if (rateData && rateData.resetAt > now) {
    rateData.count += 1;
    if (rateData.count > RATE_LIMIT) {
      return NextResponse.json(
        { error: 'Muitas requisições. Tente novamente mais tarde.' },
        { status: 429 }
      );
    }
  } else {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  }

  if (rateLimitMap.size > 1000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (val.resetAt < now) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!isPublicRoute(req)) {
    auth().protect();
  }

  const response = NextResponse.next();
  // Security headers are set in next.config.mjs — do NOT duplicate them here.
  // Having duplicate CSP headers causes the browser to enforce BOTH (most restrictive wins),
  // which blocks resources and causes blank pages.
  return response;
}, {
  clockSkewInMs: 120_000,
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
