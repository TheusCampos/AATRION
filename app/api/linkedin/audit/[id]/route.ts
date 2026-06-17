import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

type Params = { params: { id: string } };

/**
 * GET /api/linkedin/audit/:id
 * Retorna uma auditoria LinkedIn específica do usuário autenticado.
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const audit = await prisma.linkedInAudit.findFirst({
    where: { id: params.id, userId: user.id },
  });

  if (!audit) {
    return NextResponse.json({ error: 'Auditoria não encontrada' }, { status: 404 });
  }

  let result: unknown = {};
  try {
    result = JSON.parse(audit.result);
  } catch {
    result = {};
  }

  return NextResponse.json({
    audit: {
      id: audit.id,
      profileUrl: audit.profileUrl,
      area: audit.area,
      targetJob: audit.targetJob,
      overallScore: audit.overallScore,
      status: audit.status,
      createdAt: audit.createdAt,
    },
    result,
  });
}

/**
 * DELETE /api/linkedin/audit/:id
 * Remove uma auditoria.
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const existing = await prisma.linkedInAudit.findFirst({
    where: { id: params.id, userId: user.id },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Auditoria não encontrada' }, { status: 404 });
  }

  await prisma.linkedInAudit.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
