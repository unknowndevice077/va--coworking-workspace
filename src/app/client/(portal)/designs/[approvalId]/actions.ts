"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/client-auth";
import { botReplyToDesignComment, botReplyToApproval } from "@/lib/demo-bot";

async function assertOwnership(approvalId: string) {
  const client = await getCurrentClient();
  if (!client) redirect("/client/login");
  const approval = await prisma.designApproval.findUnique({ where: { id: approvalId } });
  if (!approval || approval.clientId !== client.id) {
    throw new Error("Not found");
  }
  return { approval, client };
}

export async function approveDesignAction(formData: FormData) {
  const approvalId = String(formData.get("approvalId"));
  const { approval, client } = await assertOwnership(approvalId);
  await prisma.designApproval.update({ where: { id: approvalId }, data: { status: "APPROVED" } });

  if (client.isDemo) {
    await botReplyToApproval({ workspaceId: approval.workspaceId, approvalId, clientId: client.id });
  }

  revalidatePath(`/client/designs/${approvalId}`);
  revalidatePath("/client");
}

export async function requestChangesAction(formData: FormData) {
  const approvalId = String(formData.get("approvalId"));
  const { approval, client } = await assertOwnership(approvalId);
  await prisma.designApproval.update({ where: { id: approvalId }, data: { status: "CHANGES_REQUESTED" } });

  if (client.isDemo) {
    await botReplyToDesignComment({ workspaceId: approval.workspaceId, approvalId });
  }

  revalidatePath(`/client/designs/${approvalId}`);
  revalidatePath("/client");
}

export async function postDesignCommentAction(formData: FormData) {
  const approvalId = String(formData.get("approvalId"));
  const body = String(formData.get("body") ?? "").trim();
  const { approval, client } = await assertOwnership(approvalId);
  if (!body) return;
  await prisma.designComment.create({ data: { workspaceId: approval.workspaceId, approvalId, body, fromVA: false } });

  if (client.isDemo) {
    await botReplyToDesignComment({ workspaceId: approval.workspaceId, approvalId });
  }

  revalidatePath(`/client/designs/${approvalId}`);
}
