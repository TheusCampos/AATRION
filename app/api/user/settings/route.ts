import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { updateSettingsSchema } from '@/lib/validations/user-settings';
import { daysUntilRenewal } from '@/lib/plan';
import { stripe } from '@/lib/stripe';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  let cancelAtPeriodEnd = false;
  if (user.stripeSubscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      cancelAtPeriodEnd = subscription.cancel_at_period_end;
    } catch (e) {
      console.error('Failed to retrieve subscription', e);
    }
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      jobTitle: user.jobTitle,
      location: user.location,
      linkedinUrl: user.linkedinUrl,
      allowPdfDownload: user.allowPdfDownload,
    },
    plan: {
      code: user.plan,
      startedAt: user.planStartedAt,
      renewsAt: user.planRenewsAt,
      daysUntilRenewal: daysUntilRenewal(user.planRenewsAt),
      cancelAtPeriodEnd,
    },
    usage: user.usage,
    limits: user.limits,
  });
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  if (!user.limits.allowSettings) {
    return NextResponse.json(
      { error: 'Seu plano não permite editar configurações.' },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = updateSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Converte string vazia em null para campos opcionais URL.
  const data: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.phone !== undefined) data.phone = parsed.data.phone;
  if (parsed.data.jobTitle !== undefined) data.jobTitle = parsed.data.jobTitle;
  if (parsed.data.location !== undefined) data.location = parsed.data.location;
  if (parsed.data.linkedinUrl !== undefined) {
    data.linkedinUrl = parsed.data.linkedinUrl === '' ? null : parsed.data.linkedinUrl;
  }
  if (parsed.data.allowPdfDownload !== undefined) {
    data.allowPdfDownload = parsed.data.allowPdfDownload;
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      jobTitle: true,
      location: true,
      linkedinUrl: true,
      allowPdfDownload: true,
      plan: true,
      planRenewsAt: true,
      planStartedAt: true,
    },
  });

  return NextResponse.json({
    user: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      jobTitle: updated.jobTitle,
      location: updated.location,
      linkedinUrl: updated.linkedinUrl,
      allowPdfDownload: updated.allowPdfDownload,
    },
    plan: {
      code: updated.plan,
      startedAt: updated.planStartedAt,
      renewsAt: updated.planRenewsAt,
      daysUntilRenewal: daysUntilRenewal(updated.planRenewsAt),
    },
  });
}
