"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function createClientAction(_prevState: { error?: string } | undefined, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };

  const name = String(formData.get("name") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const services = String(formData.get("services") ?? "").trim();
  const monthlyValue = Number(formData.get("monthlyValue") ?? 0);
  const status = String(formData.get("status") ?? "ONBOARDING");

  if (!name || !contactEmail) {
    return { error: "Client name and contact email are required." };
  }

  const client = await prisma.client.create({
    data: {
      name,
      contactName: contactName || "—",
      contactEmail,
      services: services || "General",
      monthlyValueCents: Math.round(monthlyValue * 100),
      status,
    },
  });

  revalidatePath("/clients");
  redirect(`/clients/${client.id}`);
}

export async function updateClientStatusAction(clientId: string, status: string) {
  const user = await getCurrentUser();
  if (!user) return;
  await prisma.client.update({ where: { id: clientId }, data: { status } });
  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
}
