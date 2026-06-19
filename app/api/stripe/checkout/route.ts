import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { stripe } from '@/lib/stripe';

/**
 * GET /api/stripe/checkout?plan=PRO|MAX
 *
 * Cria uma Checkout Session do Stripe para o plano contratado,
 * garantindo o redirecionamento de volta para o dashboard com o session_id.
 *
 * Se o usuário não estiver logado, redireciona para /login preservando o plano
 * escolhido via redirect_url, para que após o login ele vá direto ao checkout.
 */
export async function GET(request: Request) {
  const { searchParams, host, protocol } = new URL(request.url);
  const plan = searchParams.get('plan');
  console.log(`[Stripe Checkout] Plan requested: ${plan}`);

  try {
    // 1. Verifica se o usuário está logado
    const user = await getCurrentUser();
    if (!user) {
      console.log('[Stripe Checkout] User not authenticated, redirecting to login with plan context.');
      // Preserva o plano escolhido na URL de redirect para que após o login
      // o Clerk redirecione automaticamente para o checkout do plano certo
      const checkoutUrl = encodeURIComponent(`/api/stripe/checkout?plan=${plan}`);
      return NextResponse.redirect(new URL(`/login?redirect_url=${checkoutUrl}`, request.url));
    }

    // 2. Garante que o usuário tem um e-mail vinculado
    if (!user.email) {
      console.warn(`[Stripe Checkout] User ${user.id} does not have an email address linked.`);
      return NextResponse.json(
        { error: 'Você precisa ter um e-mail vinculado à sua conta para realizar o pagamento.' },
        { status: 400 }
      );
    }

    console.log(`[Stripe Checkout] User: ${user.id} (${user.email})`);

    // 3. Determina o Price ID correto com base no plano
    let priceId = '';
    if (plan === 'PRO') {
      priceId = process.env.STRIPE_PRICE_ID_PRO || 'price_1TjkNyCjuX2Xhw9UbqujHlRg';
    } else if (plan === 'MAX') {
      priceId = process.env.STRIPE_PRICE_ID_MAX || 'price_1TjkRDCjuX2Xhw9UucLIvTL2';
    } else {
      console.warn(`[Stripe Checkout] Invalid plan param: ${plan}`);
      return NextResponse.json(
        { error: 'Plano inválido. Utilize PRO ou MAX.' },
        { status: 400 }
      );
    }

    // Usa a URL de origem da requisição como prioridade para evitar
    // redirecionamentos para a porta errada (ex: localhost:3000 vs 3001).
    // Fallback para NEXT_PUBLIC_APP_URL se a origem não estiver disponível.
    const originUrl = request.headers.get('origin') || `${protocol}//${host}`;
    const appUrl = originUrl || process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');

    // 4. Cria a sessão de checkout dinâmica no Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${appUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing`,
      client_reference_id: user.id,
      customer_email: user.email,
    });

    console.log(`[Stripe Checkout] Session created: ${session.id}. Redirecting to: ${session.url}`);

    return NextResponse.redirect(session.url as string);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Stripe Checkout] Unexpected error:', message);
    // SEC-012: Não expor detalhes internos ao cliente
    return NextResponse.json(
      { error: 'Erro interno no checkout. Tente novamente em alguns instantes.' },
      { status: 500 }
    );
  }
}

