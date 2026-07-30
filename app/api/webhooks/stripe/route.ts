/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { logSystemAction } from '@/lib/logger';
import { startTimer, trackApiCall } from '@/lib/api-telemetry';

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
  const getElapsed = startTimer();
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  // SEC-001: NUNCA processar eventos sem verificar assinatura
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET não está configurada. Recusando request.');
    trackApiCall({
      req: request,
      routeName: '/api/webhooks/stripe',
      status: 500,
      durationMs: getElapsed(),
      responseMessage: 'Webhook não configurado corretamente.',
    });
    return NextResponse.json(
      { error: 'Webhook não configurado corretamente.' },
      { status: 500 }
    );
  }

  if (!signature) {
    console.warn('[Stripe Webhook] Request sem header stripe-signature.');
    trackApiCall({
      req: request,
      routeName: '/api/webhooks/stripe',
      status: 400,
      durationMs: getElapsed(),
      responseMessage: 'Missing signature',
    });
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err: any) {
    console.warn('[Stripe Webhook] Verificação de assinatura falhou:', err.message);
    trackApiCall({
      req: request,
      routeName: '/api/webhooks/stripe',
      status: 400,
      durationMs: getElapsed(),
      responseMessage: 'Invalid signature',
      error: err,
    });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log(`[Stripe Webhook] Evento recebido: ${event.type}`);

  // SEC-003: Idempotência de Webhook
  try {
    const existingEvent = await prisma.processedEvent.findUnique({
      where: { id: event.id },
    });
    if (existingEvent) {
      console.log(`[Stripe Webhook] Evento ${event.id} já foi processado. Ignorando.`);
      trackApiCall({
        req: request,
        routeName: '/api/webhooks/stripe',
        status: 200,
        durationMs: getElapsed(),
        responseMessage: 'Event already processed',
        details: { eventType: event.type, eventId: event.id, ignored: true },
      });
      return NextResponse.json({ received: true, ignored: true });
    }
  } catch (err) {
    console.warn(`[Stripe Webhook] Falha ao verificar idempotência, continuando...`, err);
  }

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
              
              // SEC-FIX: Log da ação do sistema (upgrade via assinatura)
              await logSystemAction({ 
                userId, 
                action: 'PLAN_UPGRADED', 
                details: { plan, priceId, via: 'subscription' } 
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
                
                await prisma.user.update({
                  where: { id: userId },
                  data: {
                    stripeCustomerId: customerId,
                    stripePriceId: priceId,
                    plan,
                    planStartedAt: new Date(),
                    planRenewsAt: null, 
                    stripeCurrentPeriodEnd: null,
                  },
                });

                // SEC-FIX: Log da ação do sistema (upgrade via pagamento único)
                await logSystemAction({ 
                  userId, 
                  action: 'PLAN_UPGRADED', 
                  details: { plan, priceId, via: 'payment' } 
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

        const updatedUsers = await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            planRenewsAt: new Date(subscription.current_period_end * 1000),
            plan: isActive ? plan : 'FREE',
          },
        });

        // SEC-FIX: Log da mudança de status da assinatura (upgrade/downgrade)
        if (updatedUsers.count > 0) {
            await logSystemAction({ 
              userId: 'customer-' + customerId, 
              action: isActive ? 'PLAN_UPGRADED' : 'PLAN_DOWNGRADED', 
              details: { plan, customerId, status: subscription.status } 
            });
        }

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
        
        // SEC-FIX: Log do cancelamento de assinatura
        await logSystemAction({ 
          userId: 'customer-' + customerId, 
          action: 'SUBSCRIPTION_CANCELLED', 
          details: { customerId } 
        });
        
        console.log(`[Stripe Webhook] Cancelamento de assinatura para customer ${customerId}`);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const customerId = typeof charge.customer === 'string' ? charge.customer : charge.customer?.id;

        if (customerId) {
          await prisma.user.updateMany({
            where: { stripeCustomerId: customerId },
            data: {
              plan: 'FREE',
              stripeSubscriptionId: null,
              stripePriceId: null,
              planRenewsAt: null,
              stripeCurrentPeriodEnd: null,
            },
          });
          
          // SEC-FIX: Log do estorno de pagamento
          await logSystemAction({ 
            userId: 'customer-' + customerId, 
            action: 'PAYMENT_REFUNDED', 
            details: { customerId, chargeId: charge.id } 
          });
          
          console.log(`[Stripe Webhook] Estorno (Refund) processado. Conta rebaixada para FREE do customer ${customerId}`);
        }
        break;
      }
    }

    // Registra o evento como processado
    try {
      await prisma.processedEvent.create({
        data: {
          id: event.id,
          type: event.type,
        },
      });
    } catch (err) {
      console.warn(`[Stripe Webhook] Falha ao salvar ProcessedEvent:`, err);
    }
  } catch (error) {
    console.error('[Stripe Webhook] Erro no processamento:', error);
    trackApiCall({
      req: request,
      routeName: '/api/webhooks/stripe',
      status: 500,
      durationMs: getElapsed(),
      responseMessage: 'Webhook handler failed',
      error,
    });
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  trackApiCall({
    req: request,
    routeName: '/api/webhooks/stripe',
    status: 200,
    durationMs: getElapsed(),
    details: { eventType: event.type, eventId: event.id },
  });

  return NextResponse.json({ received: true });
}

