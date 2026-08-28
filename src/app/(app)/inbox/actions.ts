"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function sendMessageAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const threadId = String(formData.get("threadId"));
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const thread = await prisma.messageThread.findUnique({ where: { id: threadId } });
  if (!thread || thread.workspaceId !== user.workspaceId) return;

  await prisma.message.create({ data: { workspaceId: user.workspaceId, threadId, body, fromVA: true } });
  await prisma.messageThread.update({ where: { id: threadId }, data: { updatedAt: new Date() } });

  revalidatePath("/inbox");
}
