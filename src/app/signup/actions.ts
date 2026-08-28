"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function signupAction(_prevState: { error?: string } | undefined, formData: FormData) {
  const workspaceName = String(formData.get("workspaceName") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!workspaceName || !name || !email || !password) {
    return { error: "Fill in every field." };
  }
  if (password.length < 8) {
    return { error: "Choose a password with at least 8 characters." };
  }
  if (password !== confirm) {
    return { error: "Passwords don't match." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists — sign in instead." };
  }

  // A brand-new, empty workspace — no seeded clients, projects, or
  // invoices. This is the whole point of real signup vs. the shared demo
  // account: everyone who signs up starts from a blank slate that's
  // theirs alone (see prisma/schema.prisma's Workspace model).
  const passwordHash = await bcrypt.hash(password, 10);
  const workspace = await prisma.workspace.create({ data: { name: workspaceName } });
  const user = await prisma.user.create({
    data: { workspaceId: workspace.id, name, email, passwordHash },
  });

  await createSession(user.id);
  redirect("/dashboard");
}
