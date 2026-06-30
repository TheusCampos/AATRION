import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Only protect authenticated routes — everything else is public by default
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/resumes(.*)',
  '/linkedin(.*)',
  '/settings(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth().protect();
  }
  // Security headers (CSP, X-Frame-Options, etc.) are set in next.config.mjs.
  // Do NOT set them here — duplicate CSP headers cause the browser to enforce
  // the most restrictive combination, which blocks resources and causes blank pages.
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
