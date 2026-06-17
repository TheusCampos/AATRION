import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { updateResumeSchema } from '@/lib/validations/resume';

type Params = { params: { id: string } };

/**
 * GET /api/resumes/:id
 * Retorna um currículo do usuário autenticado.
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const resume = await prisma.resume.findFirst({
    where: { id: params.id, userId: user.id },
  });

  if (!resume) {
    return NextResponse.json({ error: 'Currículo não encontrado' }, { status: 404 });
  }

  return NextResponse.json({ resume });
}

/**
 * PUT /api/resumes/:id
 * Atualiza título / conteúdo / template / cores.
 * Aceita partial updates (autosave envia title + content).
 */
export async function PUT(req: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = updateResumeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Verificar propriedade
  const existing = await prisma.resume.findFirst({
    where: { id: params.id, userId: user.id },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Currículo não encontrado' }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) data.title = parsed.data.title;
  if (parsed.data.content !== undefined) data.content = JSON.stringify(parsed.data.content);
  if (parsed.data.templateId !== undefined) data.templateId = parsed.data.templateId;
  if (parsed.data.colorScheme !== undefined) data.colorScheme = parsed.data.colorScheme;

  const resume = await prisma.resume.update({
    where: { id: params.id },
    data,
    select: { id: true, title: true, updatedAt: true },
  });

  return NextResponse.json({ resume });
}

/**
 * DELETE /api/resumes/:id
 * Remove um currículo do usuário autenticado.
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const existing = await prisma.resume.findFirst({
    where: { id: params.id, userId: user.id },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Currículo não encontrado' }, { status: 404 });
  }

  await prisma.resume.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
