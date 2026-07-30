import { captureServerEvent, captureServerError, sanitizeData } from './posthog-server';

export interface TrackApiOptions {
  req?: Request;
  routeName: string;
  method?: string;
  status: number;
  durationMs: number;
  userId?: string | null;
  responseMessage?: string;
  error?: unknown;
  details?: Record<string, unknown>;
}

/**
 * Registra a execução de uma rota de API no PostHog, capturando status, latência,
 * mensagem de resposta e erros de servidor/validação.
 */
export function trackApiCall(options: TrackApiOptions) {
  try {
    const {
      req,
      routeName,
      method = req?.method || 'UNKNOWN',
      status,
      durationMs,
      userId = null,
      responseMessage,
      error,
      details,
    } = options;

    const isSuccess = status >= 200 && status < 400;
    const is4xx = status >= 400 && status < 500;
    const is5xx = status >= 500;

    const sanitizedDetails = sanitizeData(details) as Record<string, unknown>;

    // Evento geral de acesso à API
    captureServerEvent(userId, 'api_route_accessed', {
      route: routeName,
      method,
      status,
      duration_ms: Math.round(durationMs),
      success: isSuccess,
      is_4xx: is4xx,
      is_5xx: is5xx,
      response_message: responseMessage,
      ...sanitizedDetails,
    });

    // Se houve erro (4xx ou 5xx), registrar o evento estruturado de erro de API
    if (is4xx || is5xx || error) {
      captureServerEvent(userId, 'api_error_response', {
        route: routeName,
        method,
        status,
        duration_ms: Math.round(durationMs),
        error_type: is4xx ? 'ClientError_4xx' : 'ServerError_5xx',
        response_message: responseMessage || (error instanceof Error ? error.message : 'Unknown API Error'),
        ...sanitizedDetails,
      });

      // Se for um erro 5xx ou se houver um objeto de exceção retornado, registrar no Error Tracking ($exception)
      if (is5xx || error instanceof Error) {
        captureServerError(error || new Error(responseMessage || `API Error ${status} on ${routeName}`), {
          userId,
          route: routeName,
          method,
          status,
          responseMessage,
          ...sanitizedDetails,
        });
      }
    }
  } catch (err) {
    console.warn('[Telemetry] Erro ao registrar telemetria da API:', err);
  }
}

/**
 * Helper para medir o tempo de execução de uma rota de API.
 */
export function startTimer() {
  const start = performance.now();
  return () => performance.now() - start;
}
