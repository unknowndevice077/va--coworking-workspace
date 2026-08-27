"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/client-auth";

export async function sendClientMessageAction(formData: FormData) {
  const client = await getCurrentClient();
  if (!client) redirect("/client/login");

  const threadId = String(formData.get("threadId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const thread = await prisma.messageThread.findUnique({ where: { id: threadId } });
  if (!thread || thread.clientId !== client.id) {
    throw new Error("Not found");
  }

  await prisma.message.create({ data: { threadId, body, fromVA: false } });
  await prisma.messageThread.update({ where: { id: threadId }, data: { updatedAt: new Date() } });
  revalidatePath("/client/inbox");
}
