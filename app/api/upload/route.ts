import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client } from '@/lib/r2';
import { getCurrentUser } from '@/lib/auth';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // SEC-006: Rate limiting por usuário
    const rl = await checkRateLimit(`upload:${user.id}`, RATE_LIMITS.upload);
    if (!rl.allowed) return rl.response;

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Limite de 2MB para foto
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'A imagem é muito grande. O limite máximo é 2MB.' },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Formato de arquivo inválido. Apenas JPG, JPEG, PNG e WEBP são permitidos.' },
        { status: 400 }
      );
    }

    const fileExtension = file.name.split('.').pop() || 'png';
    const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;
    const key = `photos/${user.id}/${cleanFileName}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await r2Client.send(
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME || 'cvforge-uploads',
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const relativeUrl = `/api/files/${key}`;

    return NextResponse.json({ url: relativeUrl });
  } catch (error) {
    console.error('Erro no upload para o R2:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar o upload do arquivo.' },
      { status: 500 }
    );
  }
}
