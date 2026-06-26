export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { NodeSDK } = await import('@opentelemetry/sdk-node');
    const { OTLPLogExporter } = await import('@opentelemetry/exporter-logs-otlp-http');
    const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-http');
    const { SimpleLogRecordProcessor } = await import('@opentelemetry/sdk-logs');
    const { resourceFromAttributes } = await import('@opentelemetry/resources');
    const { GenAIInstrumentation } = await import('@traceloop/instrumentation-google-generativeai');

    const posthogApiKey = process.env.POSTHOG_API_KEY;
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

    if (!posthogApiKey) {
      console.warn('[Instrumentation] POSTHOG_API_KEY não configurada. Telemetria desativada.');
      return;
    }

    const resource = resourceFromAttributes({
      'service.name': 'atrion',
    });

    const logExporter = new OTLPLogExporter({
      url: `${posthogHost}/otlp/v1/logs`,
      headers: { Authorization: `Bearer ${posthogApiKey}` },
    });

    const traceExporter = new OTLPTraceExporter({
      url: `${posthogHost}/otlp/v1/traces`,
      headers: { Authorization: `Bearer ${posthogApiKey}` },
    });

    const sdk = new NodeSDK({
      resource,
      traceExporter,
      logRecordProcessor: new SimpleLogRecordProcessor(logExporter),
      instrumentations: [new GenAIInstrumentation()],
    });

    sdk.start();

    const { logs } = await import('@opentelemetry/api-logs');
    ;(globalThis as any).__posthogLogger = logs.getLogger('atrion');
  }
}
