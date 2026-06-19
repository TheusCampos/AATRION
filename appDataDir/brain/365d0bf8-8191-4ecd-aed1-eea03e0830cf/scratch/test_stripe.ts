import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-01-27.acacia' as any,
});

async function main() {
  console.log('--- Listing Payment Links ---');
  try {
    const paymentLinks = await stripe.paymentLinks.list({ limit: 10 });
    for (const pl of paymentLinks.data) {
      console.log(`Payment Link: ID=${pl.id}, URL=${pl.url}, Active=${pl.active}`);
    }
  } catch (err) {
    console.error('Error listing payment links:', err);
  }

  console.log('--- Listing Prices ---');
  try {
    const prices = await stripe.prices.list({ limit: 10 });
    for (const pr of prices.data) {
      console.log(`Price: ID=${pr.id}, UnitAmount=${pr.unit_amount}, Product=${pr.product}, Active=${pr.active}`);
    }
  } catch (err) {
    console.error('Error listing prices:', err);
  }
}

main();
