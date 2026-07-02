import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { clerkClient } from '@clerk/nextjs/server';

import { stripe } from '@/lib/stripe';

/**
 * DELETE /api/user/delete
 * Remove completamente a conta do usuário e todos os seus dados do banco (Cascade) e do Clerk.
 */
export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  try {
    // SEC-014: LGPD - Excluir e Cancelar Assinatura
    // Cancelar assinatura no Stripe se for plano pago
    if (user.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(user.stripeSubscriptionId);
        console.log(`[LGPD Delete] Assinatura cancelada para usuário ${user.id}`);
      } catch (stripeErr) {
        console.error(`[LGPD Delete Error] Falha ao cancelar assinatura do Stripe:`, stripeErr);
        // Continua a deleção do usuário mesmo que a Stripe dê erro, 
        // ou você pode lançar erro e barrar. Melhor não barrar a deleção.
      }
    }
    
    // Deleta do Prisma (resumes, audits e logs são removidos via Cascade)
    await prisma.user.delete({
      where: { id: user.id }
    });

    // Tenta apagar do Clerk para revogar acesso e apagar PII lá também
    if (user.clerkId) {
      await clerkClient().users.deleteUser(user.clerkId);
    }

    return NextResponse.json({ ok: true, message: 'Conta excluída permanentemente.' });
  } catch (error) {
    console.error('[LGPD Delete Error]', error);
    return NextResponse.json({ error: 'Falha ao tentar excluir a conta' }, { status: 500 });
  }
}
