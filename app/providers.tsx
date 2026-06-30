'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      if (pathname && typeof posthog !== 'undefined' && typeof posthog.capture === 'function') {
        let url = window.origin + pathname;
        const search = searchParams.toString();
        if (search) url += `?${search}`;
        posthog.capture('$pageview', { $current_url: url });
      }
    } catch (error) {
      console.warn('PostHog capture failed.');
    }
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      if (typeof posthog !== 'undefined' && typeof posthog.init === 'function') {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
          person_profiles: 'identified_only',
          capture_pageview: false,
        });
      }
    } catch (error) {
      console.warn('PostHog initialization failed or was blocked by the browser.');
    }
  }, []);

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  );
}
