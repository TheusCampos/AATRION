/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    serverComponentsExternalPackages: [
      'pdf-parse',
      '@opentelemetry/sdk-node',
      '@opentelemetry/resources',
      '@opentelemetry/instrumentation',
      '@opentelemetry/exporter-logs-otlp-http',
      '@opentelemetry/exporter-trace-otlp-http',
      '@traceloop/instrumentation-google-generativeai',
      'require-in-the-middle',
    ],
    instrumentationHook: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'r2.cvforge.com.br' },
      { protocol: 'https', hostname: 'media.licdn.com' },
      { protocol: 'https', hostname: '*.cloudflare.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.aatrion.com.br https://challenges.cloudflare.com https://www.googletagmanager.com https://*.posthog.com https://us-assets.i.posthog.com https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://r2.cvforge.com.br https://media.licdn.com https://*.cloudflare.com https://img.clerk.com https://placehold.co",
              "frame-src 'self' blob: https://js.stripe.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.aatrion.com.br https://accounts.aatrion.com.br https://challenges.cloudflare.com",
              "connect-src 'self' ws: wss: webpack: https://*.clerk.accounts.dev https://*.clerk.com https://clerk.aatrion.com.br https://accounts.aatrion.com.br https://clerk-telemetry.com https://api.stripe.com https://api.adzuna.com https://openrouter.ai https://www.google-analytics.com https://*.google-analytics.com https://*.posthog.com https://us.i.posthog.com",
              "worker-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
            ].join('; '),
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://aatrion.com.br' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,PATCH,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Vary', value: 'Origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
