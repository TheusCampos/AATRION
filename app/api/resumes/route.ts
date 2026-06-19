import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createResumeSchema, emptyResumeContent } from '@/lib/validations/resume';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      templateId: true,
      colorScheme: true,
      atsScore: true,
      updatedAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ resumes });
}

const createResumeSchemaWithTemplate = createResumeSchema.extend({
  templateId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const parsed = createResumeSchemaWithTemplate.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Limite de curriculos conforme o plano.
  const { maxResumes } = user.limits;
  if (maxResumes !== -1) {
    const count = await prisma.resume.count({ where: { userId: user.id } });
    if (count >= maxResumes) {
      return NextResponse.json(
        {
          error: `Você atingiu o limite do plano Grátis (${maxResumes} currículo). Faça upgrade para o plano Pro para criar, importar e ter acesso a recursos ilimitados!`,
        },
        { status: 403 }
      );
    }
  }

  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      title: parsed.data.title,
      templateId: parsed.data.templateId || 'classic',
      content: JSON.stringify(emptyResumeContent()),
    },
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json({ resume }, { status: 201 });
}


