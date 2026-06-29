'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Captura a exceção no Error Tracking do PostHog (Next.js App Router)
    try {
      if (posthog && typeof posthog.capture === 'function') {
        posthog.capture('$exception', {
          $exception_message: error.message,
          $exception_type: error.name,
          $exception_personURL: typeof window !== 'undefined' ? window.location.href : '',
          // Se houver mais detalhes, como stack trace
          $exception_stack_trace_raw: error.stack,
        });
      }
    } catch (e) {
      console.error('Failed to capture error in PostHog', e);
    }
  }, [error]);

  return (
    <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Ops! Algo deu errado.
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          {error.message || 'Ocorreu um erro inesperado ao carregar esta página.'}
        </p>
      </div>
      <button
        onClick={() => reset()}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Tentar novamente
      </button>
    </div>
  );
}
