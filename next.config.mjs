/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'pdfjs-dist', 'mammoth'],
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
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://cvforge.com.br' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,PATCH,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;
