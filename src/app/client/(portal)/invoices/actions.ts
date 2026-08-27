"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/client-auth";
import { getStripe } from "@/lib/stripe";
import { getAppUrl } from "@/lib/url";

export async function createCheckoutSessionAction(formData: FormData) {
  const client = await getCurrentClient();
  if (!client) redirect("/client/login");

  const invoiceId = String(formData.get("invoiceId") ?? "");
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice || invoice.clientId !== client.id) {
    throw new Error("Not found");
  }
  if (invoice.status === "PAID") redirect("/client");

  const stripe = getStripe();
  if (!stripe) redirect("/client"); // defensive — the button is hidden whenever this is null

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: `Invoice #${invoice.number} — ${client.name}` },
          unit_amount: invoice.amountCents,
        },
        quantity: 1,
      },
    ],
    success_url: `${getAppUrl()}/client?paid=1`,
    cancel_url: `${getAppUrl()}/client?paid=0`,
    client_reference_id: invoice.id,
    metadata: { invoiceId: invoice.id },
  });

  await prisma.invoice.update({ where: { id: invoice.id }, data: { stripeCheckoutSessionId: session.id } });

  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  redirect(session.url);
}
