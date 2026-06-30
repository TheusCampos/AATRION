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
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://*.clerk.com https://www.googletagmanager.com https://js.stripe.com https://*.posthog.com https://us-assets.i.posthog.com;
    connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://api.stripe.com https://www.google-analytics.com https://*.posthog.com https://openrouter.ai;
    img-src 'self' blob: data: https://img.clerk.com https://r2.cvforge.com.br https://media.licdn.com https://*.cloudflare.com https://placehold.co;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' data: https://fonts.gstatic.com;
    frame-src 'self' https://js.stripe.com https://challenges.cloudflare.com;
    worker-src 'self' blob:;
  `.replace(/\s{2,}/g, ' ').trim();

  response.headers.set('Content-Security-Policy', cspHeader);

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
