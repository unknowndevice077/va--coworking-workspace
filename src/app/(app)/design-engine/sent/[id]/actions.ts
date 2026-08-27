"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function replyToDesignFeedbackAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const approvalId = String(formData.get("approvalId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  await prisma.designComment.create({ data: { approvalId, body, fromVA: true } });
  revalidatePath(`/design-engine/sent/${approvalId}`);
  revalidatePath("/design-engine/sent");
}
