import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/cleanup
 * Rota para rodar limpezas periódicas (Cron Job).
 * Pode ser configurada no Vercel (vercel.json) ou em um serviço externo (GitHub Actions, cron-job.org, etc).
 */
export async function GET(request: Request) {
  // SEC-007: Proteção da rota do Cron Job
  // Utilize a variável de ambiente CRON_SECRET (padrão em plataformas como Vercel)
  
  // No build do Next.js, o `request` pode vir vazio em avaliações estáticas.
  // Usar next/headers garante que ele opte pela renderização dinâmica.
  const headersList = headers();
  const authHeader = headersList.get('authorization') || (request?.headers ? request.headers.get('authorization') : null);

  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Acesso não autorizado ao Cron' }, { status: 401 });
  }

  try {
    // Regra de Negócio: Excluir currículos que não são atualizados há mais de 2 anos,
    // garantindo que não ocupem espaço no banco, aplicável apenas a planos FREE.
    const dateLimit = new Date();
    dateLimit.setFullYear(dateLimit.getFullYear() - 2);

    const deletedResumes = await prisma.resume.deleteMany({
      where: {
        updatedAt: { lt: dateLimit },
        user: { plan: 'FREE' }
      }
    });

    console.log(`[Cron Cleanup] Execução concluída com sucesso. ${deletedResumes.count} currículos antigos removidos.`);

    return NextResponse.json({
      success: true,
      message: `Limpeza finalizada. ${deletedResumes.count} registros deletados.`
    });
  } catch (error) {
    console.error('[Cron Cleanup] Erro durante a limpeza:', error);
    return NextResponse.json({ error: 'Falha na execução da limpeza' }, { status: 500 });
  }
}
