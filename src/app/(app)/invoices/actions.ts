"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function markPaidAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const invoiceId = String(formData.get("invoiceId"));
  await prisma.invoice.updateMany({ where: { id: invoiceId, workspaceId: user.workspaceId }, data: { status: "PAID" } });
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
}

export async function createInvoiceAction(_prevState: { error?: string } | undefined, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };

  const clientId = String(formData.get("clientId") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  const dueLabel = String(formData.get("dueLabel") ?? "").trim();

  if (!clientId || amount <= 0) return { error: "Pick a client and enter an amount." };

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client || client.workspaceId !== user.workspaceId) return { error: "Pick a client and enter an amount." };

  const last = await prisma.invoice.findFirst({ where: { workspaceId: user.workspaceId }, orderBy: { number: "desc" } });
  const nextNumber = String((Number(last?.number ?? "1040") || 1040) + 1);

  await prisma.invoice.create({
    data: { workspaceId: user.workspaceId, number: nextNumber, clientId, amountCents: Math.round(amount * 100), status: "DRAFT", dueLabel: dueLabel || null },
  });

  revalidatePath("/invoices");
  redirect("/invoices");
}
