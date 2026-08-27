"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createClientSession } from "@/lib/client-auth";

export async function clientLoginAction(_prevState: { error?: string } | undefined, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const client = await prisma.client.findFirst({ where: { contactEmail: { equals: email, mode: "insensitive" } } });
  if (!client) {
    return { error: "No client account found with that email." };
  }
  if (!client.passwordHash) {
    return { error: "This account hasn't been set up yet — check your email for a setup link, or ask your VA to resend it." };
  }

  const valid = await bcrypt.compare(password, client.passwordHash);
  if (!valid) {
    return { error: "Incorrect password." };
  }

  await createClientSession(client.id);
  redirect("/client");
}
