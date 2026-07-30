import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Only protect authenticated routes — everything else is public by default
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/resumes(.*)',
  '/linkedin(.*)',
  '/settings(.*)',
  '/admin(.*)',
]);

export default clerkMiddleware(
  async (auth, req) => {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  },
  {
    // Tolerate up to 3 minutes of clock skew between the server and Clerk servers.
    // This prevents redirect loops caused by JWT 'not before' (nbf) errors when
    // the local system clock is slightly behind.
    clockSkewInMs: 180_000,
  }
);

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
