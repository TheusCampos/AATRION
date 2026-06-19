import { NextRequest, NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { r2Client } from '@/lib/r2';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { key: string[] } }
) {
  try {
    // SEC-007: Verificar autenticação antes de servir arquivos
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse('Não autenticado', { status: 401 });
    }

    if (!params.key || params.key.length === 0) {
      return new NextResponse('Caminho do arquivo não fornecido', { status: 400 });
    }

    const key = params.key.join('/');

    // SEC-007: Validar que o usuário só pode acessar seus próprios arquivos.
    // Arquivos de fotos seguem o padrão: photos/{userId}/{filename}
    if (key.startsWith('photos/') && !key.startsWith(`photos/${user.id}/`)) {
      return new NextResponse('Acesso negado', { status: 403 });
    }

    const response = await r2Client.send(
      new GetObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME || 'cvforge-uploads',
        Key: key,
      })
    );

    if (!response.Body) {
      return new NextResponse('Arquivo não encontrado', { status: 404 });
    }

    const data = await response.Body.transformToByteArray();
    const buffer = Buffer.from(data);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': response.ContentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Erro ao recuperar arquivo do R2:', error);
    const err = error as Error;
    if (err.name === 'NoSuchKey') {
      return new NextResponse('Arquivo não encontrado', { status: 404 });
    }
    return new NextResponse('Erro ao recuperar o arquivo do servidor', { status: 500 });
  }
}
