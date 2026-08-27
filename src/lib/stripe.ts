import "server-only";
import Stripe from "stripe";

// Zero-config-safe payments: with no STRIPE_SECRET_KEY set, isStripeConfigured()
// is false everywhere "Pay now" would render, so the button simply never
// shows up — no error, no broken UI, invoices just render read-only like
// they always have.
export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

let cached: Stripe | null = null;
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!cached) cached = new Stripe(key);
  return cached;
}
