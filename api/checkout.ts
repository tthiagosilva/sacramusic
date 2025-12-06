import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { userId, email, priceId } = req.body;

    // URL base do seu site (em produção ou localhost)
    const origin = req.headers.origin || 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId || process.env.STRIPE_PRICE_ID, // ID do preço criado no Dashboard do Stripe
          quantity: 1,
        },
      ],
      mode: 'subscription', // 'payment' para pagamento único, 'subscription' para recorrente
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscribe`,
      client_reference_id: userId,
      customer_email: email,
      metadata: {
        userId: userId, // Importante para identificar o usuário no Webhook
      },
    });

    res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}