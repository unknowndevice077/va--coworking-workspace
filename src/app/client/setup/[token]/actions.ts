"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createClientSession } from "@/lib/client-auth";

export async function completeClientSetupAction(_prevState: { error?: string } | undefined, formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!password || password.length < 8) {
    return { error: "Choose a password with at least 8 characters." };
  }
  if (password !== confirm) {
    return { error: "Passwords don't match." };
  }

  const client = await prisma.client.findUnique({ where: { setupToken: token } });
  if (!client || !client.setupTokenExpiresAt || client.setupTokenExpiresAt < new Date()) {
    return { error: "This setup link is invalid or has expired — ask your VA to resend it." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.client.update({
    where: { id: client.id },
    data: {
      passwordHash,
      accountCreatedAt: new Date(),
      setupToken: null,
      setupTokenExpiresAt: null,
    },
  });

  await createClientSession(client.id);
  redirect("/client");
}
