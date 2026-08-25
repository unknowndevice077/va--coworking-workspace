"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

async function assertOwnership(approvalId: string, token: string) {
  const approval = await prisma.designApproval.findUnique({ where: { id: approvalId }, include: { client: true } });
  if (!approval || approval.client.portalToken !== token) {
    throw new Error("Not found");
  }
  return approval;
}

export async function approveDesignAction(formData: FormData) {
  const token = String(formData.get("token"));
  const approvalId = String(formData.get("approvalId"));
  await assertOwnership(approvalId, token);
  await prisma.designApproval.update({ where: { id: approvalId }, data: { status: "APPROVED" } });
  revalidatePath(`/p/${token}`);
}

export async function requestChangesAction(formData: FormData) {
  const token = String(formData.get("token"));
  const approvalId = String(formData.get("approvalId"));
  await assertOwnership(approvalId, token);
  await prisma.designApproval.update({ where: { id: approvalId }, data: { status: "CHANGES_REQUESTED" } });
  revalidatePath(`/p/${token}`);
}
