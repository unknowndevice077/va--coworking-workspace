"use server";

import { redirect } from "next/navigation";
import { startDemo } from "@/lib/demo-bot";
import { getCurrentClient, destroyClientSession } from "@/lib/client-auth";
import { prisma } from "@/lib/prisma";

export async function startDemoAction(_prevState: { error?: string } | undefined, formData: FormData) {
  const promptText = String(formData.get("promptText") ?? "").trim();
  if (!promptText) return { error: "Describe what you need designed." };

  const category = String(formData.get("category") ?? "All");

  let logoDataUrl: string | undefined;
  const logoFile = formData.get("logo");
  if (logoFile instanceof File && logoFile.size > 0) {
    const buf = await logoFile.arrayBuffer();
    logoDataUrl = `data:${logoFile.type || "image/png"};base64,${Buffer.from(buf).toString("base64")}`;
  }

  await startDemo({ promptText, category, logoDataUrl });
  redirect("/client");
}

/** Ends the current demo session and deletes its throwaway client (and everything cascading off it), then starts fresh. */
export async function resetDemoAction() {
  const client = await getCurrentClient();
  await destroyClientSession();
  if (client?.isDemo) {
    await prisma.client.delete({ where: { id: client.id } }).catch(() => {});
  }
  redirect("/demo");
}
