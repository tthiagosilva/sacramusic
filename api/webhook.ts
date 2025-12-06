import { buffer } from 'micro';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

// Configuração do Firebase Admin (Necessário para escrever no banco com privilégio total)
// As chaves devem estar nas variáveis de ambiente da Vercel
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Corrige a quebra de linha da chave privada vinda do ENV
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// O Webhook precisa do corpo cru (raw body) para verificar a assinatura
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Lida com o evento de pagamento com sucesso
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;

    if (userId) {
      console.log(`Pagamento recebido para usuário: ${userId}`);
      
      // Atualiza o usuário no Firestore para Premium
      await db.collection('sacramusic_users').doc(userId).set(
        {
          isSubscriber: true,
          subscriptionId: session.subscription,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
    }
  }

  res.json({ received: true });
}