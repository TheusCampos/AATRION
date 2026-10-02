import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client } from '@/lib/r2';
import { getCurrentUser } from '@/lib/auth';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

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

    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };

    const ext = mimeToExt[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: 'Formato de arquivo inválido. Apenas JPG, JPEG, PNG e WEBP são permitidos.' },
        { status: 400 }
      );
    }

    const userName = (formData.get('userName') as string || 'usuario')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase();

    const resumeId = (formData.get('resumeId') as string || 'geral')
      .replace(/[^a-zA-Z0-9-]/g, '');

    // SEC-010: Prevenção total de Path Traversal via UUID seguro
    const cleanFileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const key = `photos/${encodeURIComponent(user.id)}/${userName}/${resumeId}/${cleanFileName}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // SEC-FIX: Validar magic bytes do arquivo além do MIME type
    const magicBytes: Record<string, number[]> = {
      jpg: [0xFF, 0xD8, 0xFF],
      png: [0x89, 0x50, 0x4E, 0x47],
      webp: [0x52, 0x49, 0x46, 0x46], // RIFF header
    };
    const expected = magicBytes[ext];
    if (expected) {
      const header = Array.from(buffer.slice(0, expected.length));
      const valid = expected.every((byte, i) => header[i] === byte);
      if (!valid) {
        return NextResponse.json(
          { error: 'O conteúdo do arquivo não corresponde ao formato declarado.' },
          { status: 400 }
        );
      }
    }

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
