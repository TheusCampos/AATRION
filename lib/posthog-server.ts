import { PostHog } from 'posthog-node';

let posthogClient: PostHog | null = null;

/**
 * Retorna uma instância singleton do PostHog Server-side.
 */
export function getPostHogClient(): PostHog | null {
  if (posthogClient) return posthogClient;

  const apiKey = process.env.POSTHOG_API_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

  if (!apiKey) {
    return null;
  }

  try {
    posthogClient = new PostHog(apiKey, {
      host,
      flushAt: 1,
      flushInterval: 0,
    });
    return posthogClient;
  } catch (err) {
    console.warn('[PostHog Server] Falha ao inicializar PostHog Node:', err);
    return null;
  }
}

/**
 * Sanitiza objetos para não enviar PII ou dados altamente sensíveis ao PostHog.
 */
export function sanitizeData(data: unknown): unknown {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  const sensitiveKeys = [
    'password',
    'token',
    'authorization',
    'secret',
    'apiKey',
    'creditCard',
    'cvv',
    'content',
    'summary',
    'cvData',
    'rawText',
  ];

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const isSensitive = sensitiveKeys.some((k) => key.toLowerCase().includes(k.toLowerCase()));
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Captura um evento customizado no PostHog Server-side.
 */
export function captureServerEvent(
  userId: string | null,
  eventName: string,
  properties: Record<string, unknown> = {}
) {
  try {
    const client = getPostHogClient();
    if (!client) return;

    const distinctId = userId || properties.distinctId || 'anonymous_server_user';
    const sanitizedProps = sanitizeData(properties) as Record<string, unknown>;

    client.capture({
      distinctId: String(distinctId),
      event: eventName,
      properties: {
        $lib: 'posthog-node',
        environment: process.env.NODE_ENV,
        ...sanitizedProps,
      },
    });
  } catch (err) {
    console.warn(`[PostHog Server] Erro ao capturar evento ${eventName}:`, err);
  }
}

/**
 * Captura uma exceção ou erro de servidor no PostHog.
 */
export function captureServerError(
  error: unknown,
  context: Record<string, unknown> = {}
) {
  try {
    const client = getPostHogClient();
    if (!client) return;

    const err = error instanceof Error ? error : new Error(String(error));
    const distinctId = (context.userId as string) || 'anonymous_server_user';
    const sanitizedContext = sanitizeData(context) as Record<string, unknown>;

    client.capture({
      distinctId: String(distinctId),
      event: '$exception',
      properties: {
        $exception_type: err.name,
        $exception_message: err.message,
        $exception_stack_trace_raw: err.stack,
        environment: process.env.NODE_ENV,
        ...sanitizedContext,
      },
    });
  } catch (e) {
    console.warn('[PostHog Server] Erro ao capturar exceção de servidor:', e);
  }
}

/**
 * Força o envio imediato de eventos pendentes (útil antes de respostas em Serverless).
 */
export async function flushServerEvents() {
  try {
    if (posthogClient) {
      await posthogClient.shutdown();
      posthogClient = null;
    }
  } catch {
    // Ignorar falha no shutdown
  }
}
