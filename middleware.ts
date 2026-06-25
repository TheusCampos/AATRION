import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define as rotas publicas que NAO exigem autenticacao.
const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/register(.*)',
  '/pricing(.*)',
  '/api/webhooks(.*)',
  '/docs(.*)',
]);

// Configuração do Rate Limit (Em memória para Edge Runtime)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 100; // Máximo de requisições
const WINDOW_MS = 60 * 1000; // Por 1 minuto

export default clerkMiddleware((auth, req) => {
  // 1. Aplica o Rate Limit Global
  const ip = req.headers.get('x-forwarded-for') ?? req.ip ?? '127.0.0.1';
  const now = Date.now();
  const rateData = rateLimitMap.get(ip);

  if (rateData && rateData.resetAt > now) {
    rateData.count += 1;
    if (rateData.count > RATE_LIMIT) {
      console.warn(`[Rate Limit] IP ${ip} bloqueado. Limite excedido.`);
      return NextResponse.json(
        { error: 'Muitas requisições. Tente novamente mais tarde.' },
        { status: 429 }
      );
    }
  } else {
    // Reseta ou cria o rate limit para este IP
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  }

  // Opcional: Limpeza simples do Map a cada ~1000 requisições para evitar memory leak no Edge
  if (rateLimitMap.size > 1000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (val.resetAt < now) {
        rateLimitMap.delete(key);
      }
    }
  }

  // 2. Proteção de Rotas pelo Clerk
  if (!isPublicRoute(req)) {
    auth().protect();
  }
}, {
  // O relógio do sistema está ~48s atrasado em relação ao Clerk.
  // Toleramos até 120s para evitar falhas de autenticação.
  clockSkewInMs: 120_000,
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
