import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createResumeSchema, emptyResumeContent } from '@/lib/validations/resume';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { startTimer, trackApiCall } from '@/lib/api-telemetry';
import { revalidatePath } from 'next/cache';

export async function GET() {
  const getElapsed = startTimer();
  const user = await getCurrentUser();
  if (!user) {
    trackApiCall({
      routeName: '/api/resumes',
      method: 'GET',
      status: 401,
      durationMs: getElapsed(),
      responseMessage: 'Não autenticado',
    });
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  // SEC-FIX: Rate limiting na listagem de currículos
  const rl = await checkRateLimit(`resumes:${user.id}`, RATE_LIMITS.general);
  if (!rl.allowed) {
    trackApiCall({
      routeName: '/api/resumes',
      method: 'GET',
      status: 429,
      durationMs: getElapsed(),
      userId: user.id,
      responseMessage: 'Rate limit excedido',
    });
    return rl.response;
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

  trackApiCall({
    routeName: '/api/resumes',
    method: 'GET',
    status: 200,
    durationMs: getElapsed(),
    userId: user.id,
    details: { count: resumes.length },
  });

  return NextResponse.json({ resumes });
}

const createResumeSchemaWithTemplate = createResumeSchema.extend({
  templateId: z.string().optional(),
  content: z.string().optional(),
  colorScheme: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const getElapsed = startTimer();
  const user = await getCurrentUser();
  if (!user) {
    trackApiCall({
      routeName: '/api/resumes',
      method: 'POST',
      status: 401,
      durationMs: getElapsed(),
      responseMessage: 'Não autenticado',
    });
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  // SEC-FIX: Rate limiting na criação de currículos
  const rl = await checkRateLimit(`resumes:${user.id}`, RATE_LIMITS.general);
  if (!rl.allowed) {
    trackApiCall({
      routeName: '/api/resumes',
      method: 'POST',
      status: 429,
      durationMs: getElapsed(),
      userId: user.id,
      responseMessage: 'Rate limit excedido',
    });
    return rl.response;
  }

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const parsed = createResumeSchemaWithTemplate.safeParse(body);
  if (!parsed.success) {
    trackApiCall({
      routeName: '/api/resumes',
      method: 'POST',
      status: 400,
      durationMs: getElapsed(),
      userId: user.id,
      responseMessage: 'Dados inválidos',
    });
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
      const msg = `Você atingiu o limite do plano Grátis (${maxResumes} currículo). Faça upgrade para o plano Pro para criar, importar e ter acesso a recursos ilimitados!`;
      trackApiCall({
        routeName: '/api/resumes',
        method: 'POST',
        status: 403,
        durationMs: getElapsed(),
        userId: user.id,
        responseMessage: msg,
      });
      return NextResponse.json(
        { error: msg },
        { status: 403 }
      );
    }
  }

  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      title: parsed.data.title,
      templateId: parsed.data.templateId || 'classic',
      content: parsed.data.content || JSON.stringify(emptyResumeContent()),
      colorScheme: parsed.data.colorScheme,
    },
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  });

  trackApiCall({
    routeName: '/api/resumes',
    method: 'POST',
    status: 201,
    durationMs: getElapsed(),
    userId: user.id,
    details: { resumeId: resume.id, title: resume.title },
  });

  revalidatePath('/dashboard');

  return NextResponse.json({ resume }, { status: 201 });
}



