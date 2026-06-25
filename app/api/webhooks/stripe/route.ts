/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

/**
 * Determina o plano (FREE/PRO/MAX) a partir do price do Stripe.
 * Tenta primeiro pelo nome do produto, fallback pelo unit_amount.
 */
async function resolvePlan(stripePrice: Stripe.Price): Promise<string> {
  const priceId = stripePrice.id;
  
  if (priceId === process.env.STRIPE_PRICE_ID_MAX) return 'MAX';
  if (priceId === process.env.STRIPE_PRICE_ID_PRO) return 'PRO';
  if (priceId === process.env.STRIPE_PRICE_ID_UNIC) return 'UNIC';
  if (priceId === process.env.STRIPE_PRICE_ID_PC_PRO) return 'PC_PRO';

  try {
    const product = await stripe.products.retrieve(stripePrice.product as string);
    const productName = (product.name || '').toLowerCase();
    if (productName.includes('max')) return 'MAX';
    if (productName.includes('pro')) return 'PRO';
    if (productName.includes('unic')) return 'UNIC';
    if (productName.includes('candidatura')) return 'PC_PRO';
  } catch {
    // Fallback por valor
  }
  const unitAmount = stripePrice.unit_amount ?? 0;
  if (unitAmount >= 3990) return 'MAX';
  if (unitAmount >= 1990) return 'PRO';
  if (unitAmount >= 990) return 'UNIC';
  return 'FREE';
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  // SEC-001: NUNCA processar eventos sem verificar assinatura
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET não está configurada. Recusando request.');
    return NextResponse.json(
      { error: 'Webhook não configurado corretamente.' },
      { status: 500 }
    );
  }

  if (!signature) {
    console.warn('[Stripe Webhook] Request sem header stripe-signature.');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err: any) {
    console.warn('[Stripe Webhook] Verificação de assinatura falhou:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log(`[Stripe Webhook] Evento recebido: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.client_reference_id) {
          const userId = session.client_reference_id;
          const customerId = session.customer as string;

          if (session.mode === 'subscription' && session.subscription) {
            const subscriptionId = session.subscription as string;
            try {
              const subscription = await stripe.subscriptions.retrieve(subscriptionId);
              const stripePrice = subscription.items.data[0].price;
              const priceId = stripePrice.id;
              const plan = await resolvePlan(stripePrice);

              await prisma.user.update({
                where: { id: userId },
                data: {
                  stripeCustomerId: customerId,
                  stripeSubscriptionId: subscriptionId,
                  stripePriceId: priceId,
                  stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
                  plan,
                  planStartedAt: new Date(),
                  planRenewsAt: new Date(subscription.current_period_end * 1000),
                  aiAnalyzeUsed: 0,
                  aiAdaptUsed: 0,
                  aiAuditUsed: 0,
                },
              });
              console.log(`[Stripe Webhook] Upgrade Subscription: user ${userId} -> ${plan}`);
            } catch (subErr: any) {
              console.error('[Stripe Webhook] Erro ao processar subscription:', subErr.message);
            }
          } else if (session.mode === 'payment') {
            try {
              const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
                expand: ['line_items'],
              });
              const stripePrice = expandedSession.line_items?.data[0]?.price;
              if (stripePrice) {
                const priceId = stripePrice.id;
                const plan = await resolvePlan(stripePrice);
                
                // One-time payments give lifetime access (or special credits)
                // For UNIC or PC_PRO, we just set the plan.
                await prisma.user.update({
                  where: { id: userId },
                  data: {
                    stripeCustomerId: customerId,
                    stripePriceId: priceId,
                    plan,
                    planStartedAt: new Date(),
                    // one-time payments do not renew
                    planRenewsAt: null, 
                    stripeCurrentPeriodEnd: null,
                  },
                });
                console.log(`[Stripe Webhook] Upgrade Payment: user ${userId} -> ${plan}`);
              }
            } catch (payErr: any) {
              console.error('[Stripe Webhook] Erro ao processar payment:', payErr.message);
            }
          } else {
            console.warn(`[Stripe Webhook] checkout.session.completed mode não tratado: ${session.mode}`);
          }
        } else {
          console.warn('[Stripe Webhook] checkout.session.completed sem client_reference_id.');
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const stripePrice = subscription.items.data[0].price;
        const priceId = stripePrice.id;
        const plan = await resolvePlan(stripePrice);

        const status = subscription.status;
        const isActive = status === 'active' || status === 'trialing';

        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            planRenewsAt: new Date(subscription.current_period_end * 1000),
            plan: isActive ? plan : 'FREE',
          },
        });
        console.log(`[Stripe Webhook] Subscription updated: customer ${customerId} -> ${isActive ? plan : 'FREE'}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            plan: 'FREE',
            stripeSubscriptionId: null,
            stripePriceId: null,
            planRenewsAt: null,
          },
        });
        console.log(`[Stripe Webhook] Cancelamento de assinatura para customer ${customerId}`);
        break;
      }
    }
  } catch (error) {
    console.error('[Stripe Webhook] Erro no processamento:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
