# Upgrade e billing

1. O usuário seleciona um plano em `/pricing`.
2. `GET /api/stripe/checkout?plan=PRO|MAX|UNIC|CANDIDATURA` verifica sessão e redireciona à Stripe.
3. A Stripe conclui ou cancela o pagamento e redireciona o navegador.
4. O webhook `POST /api/webhooks/stripe` valida a assinatura, ignora eventos já processados e atualiza plano e dados de assinatura no banco.
5. O portal Stripe pode ser aberto por `POST /api/stripe/portal`.

O webhook é a fonte de verdade para liberação de plano; o redirecionamento de sucesso não deve ser usado como confirmação de pagamento isoladamente.