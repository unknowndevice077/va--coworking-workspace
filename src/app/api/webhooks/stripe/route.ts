import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

// Stripe's SDK needs Node APIs, and signature verification needs the exact
// raw request bytes — never let anything (a proxy, a body-parsing helper)
// read/transform the body before this handler does.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return new Response("Stripe not configured", { status: 400 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  // Read as raw text BEFORE any parsing — the body stream can only be
  // consumed once, and Stripe checks the exact raw bytes, not a
  // JSON.parse(...) round-trip of them.
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${(err as Error).message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const invoiceId = session.metadata?.invoiceId ?? session.client_reference_id ?? undefined;
    const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;

    if (invoiceId) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: "PAID", paidAt: new Date(), stripePaymentIntentId: paymentIntentId ?? null },
      });
    }
  }

  return new Response("ok", { status: 200 });
}
