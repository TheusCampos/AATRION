import { S3Client } from '@aws-sdk/client-s3';

if (
  !process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ||
  !process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ||
  !process.env.CLOUDFLARE_R2_ENDPOINT
) {
  console.warn('[R2 WARNING] Credenciais R2 ausentes nas variáveis de ambiente (.env).');
}

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT || 'https://placeholder.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  },
});
