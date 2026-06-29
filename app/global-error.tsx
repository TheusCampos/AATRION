'use client';

import posthog from 'posthog-js';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Captura erros críticos de layout para o PostHog Error Tracking
    try {
      if (posthog && typeof posthog.capture === 'function') {
        posthog.capture('$exception', {
          $exception_message: error.message,
          $exception_type: error.name,
          $exception_personURL: typeof window !== 'undefined' ? window.location.href : '',
          $exception_stack_trace_raw: error.stack,
        });
      }
    } catch (e) {
      console.error('Failed to capture global error in PostHog', e);
    }
  }, [error]);

  return (
    <html lang="pt-BR">
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui' }}>
          <h2>Ops! Ocorreu um erro crítico.</h2>
          <p>{error.message}</p>
          <button
            onClick={() => reset()}
            style={{ marginTop: '16px', padding: '8px 16px', background: '#4F46E5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
