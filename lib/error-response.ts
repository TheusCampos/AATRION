import { NextResponse } from 'next/server';
import { captureServerError } from './posthog-server';

/**
 * Retorna uma resposta de erro segura para produção.
 * Em desenvolvimento, exibe a mensagem de erro original.
 * Em produção, oculta detalhes internos e exibe uma mensagem amigável genérica.
 * Registra a exceção de backend automaticamente no PostHog.
 */
export function safeErrorResponse(
  error: unknown,
  fallbackMessage = 'Ocorreu um erro interno no servidor. Tente novamente em alguns instantes.',
  status = 500
): NextResponse {
  console.error('[API Error]:', error);

  // Registrar o erro no PostHog Error Tracking
  try {
    captureServerError(error, {
      fallbackMessage,
      status,
      context: 'safeErrorResponse',
    });
  } catch (e) {
    console.warn('[safeErrorResponse] Falha ao enviar erro ao PostHog:', e);
  }

  const isDev = process.env.NODE_ENV === 'development';
  const errorMessage = isDev && error instanceof Error ? error.message : fallbackMessage;

  return NextResponse.json(
    {
      error: errorMessage,
      ...(isDev && error instanceof Error && { stack: error.stack }),
    },
    { status }
  );
}

