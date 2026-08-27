"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/client-auth";

async function assertOwnership(approvalId: string) {
  const client = await getCurrentClient();
  if (!client) redirect("/client/login");
  const approval = await prisma.designApproval.findUnique({ where: { id: approvalId } });
  if (!approval || approval.clientId !== client.id) {
    throw new Error("Not found");
  }
  return approval;
}

export async function approveDesignAction(formData: FormData) {
  const approvalId = String(formData.get("approvalId"));
  await assertOwnership(approvalId);
  await prisma.designApproval.update({ where: { id: approvalId }, data: { status: "APPROVED" } });
  revalidatePath(`/client/designs/${approvalId}`);
  revalidatePath("/client");
}

export async function requestChangesAction(formData: FormData) {
  const approvalId = String(formData.get("approvalId"));
  await assertOwnership(approvalId);
  await prisma.designApproval.update({ where: { id: approvalId }, data: { status: "CHANGES_REQUESTED" } });
  revalidatePath(`/client/designs/${approvalId}`);
  revalidatePath("/client");
}

export async function postDesignCommentAction(formData: FormData) {
  const approvalId = String(formData.get("approvalId"));
  const body = String(formData.get("body") ?? "").trim();
  await assertOwnership(approvalId);
  if (!body) return;
  await prisma.designComment.create({ data: { approvalId, body, fromVA: false } });
  revalidatePath(`/client/designs/${approvalId}`);
}
