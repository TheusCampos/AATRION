import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/user/export
 * Exporta todos os dados do usuário (Resumes, Audits, Logs) em conformidade com a LGPD.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  try {
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        resumes: true,
        audits: true,
        activityLogs: true,
      }
    });

    if (!userData) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Header para forçar download como arquivo JSON
    return new NextResponse(JSON.stringify(userData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="dados-atrion-${user.id}.json"`,
      },
    });
  } catch (error) {
    console.error('[LGPD Export Error]', error);
    return NextResponse.json({ error: 'Erro ao exportar dados' }, { status: 500 });
  }
}
