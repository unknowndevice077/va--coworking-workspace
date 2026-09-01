"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateCaptionDrafts } from "@/lib/copy-chat";

type GenerateState = { error?: string } | undefined;

export async function generateDraftsAction(_prevState: GenerateState, formData: FormData): Promise<GenerateState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const clientId = String(formData.get("clientId") ?? "");
  const topic = String(formData.get("topic") ?? "").trim();
  const platform = String(formData.get("platform") ?? "");

  if (!clientId || !topic) return { error: "Pick a client and describe what the post is about." };

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client || client.workspaceId !== user.workspaceId) return { error: "Client not found." };

  const result = await generateCaptionDrafts({ clientId, clientName: client.name, topic, platform });
  if ("error" in result) return { error: result.error };

  await prisma.draft.createMany({
    data: result.drafts.map((content) => ({
      workspaceId: user.workspaceId,
      clientId,
      prompt: topic,
      content,
      status: "PENDING",
    })),
  });

  revalidatePath("/copy-chat");
  redirect(`/copy-chat?client=${clientId}`);
}

export async function updateBrandVoiceAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const clientId = String(formData.get("clientId") ?? "");
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client || client.workspaceId !== user.workspaceId) redirect("/copy-chat");

  const toneNotes = String(formData.get("toneNotes") ?? "").trim();
  const sampleCaptions = String(formData.get("sampleCaptions") ?? "").trim();

  await prisma.brandVoice.upsert({
    where: { clientId },
    create: { workspaceId: user.workspaceId, clientId, toneNotes, sampleCaptions },
    update: { toneNotes, sampleCaptions },
  });

  revalidatePath("/copy-chat");
  redirect(`/copy-chat?client=${clientId}`);
}

export async function approveDraftAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") ?? "");
  await prisma.draft.updateMany({ where: { id, workspaceId: user.workspaceId }, data: { status: "APPROVED" } });
  revalidatePath("/copy-chat");
}

export async function rejectDraftAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") ?? "");
  const rejectReason = String(formData.get("rejectReason") ?? "").trim() || null;
  await prisma.draft.updateMany({ where: { id, workspaceId: user.workspaceId }, data: { status: "REJECTED", rejectReason } });
  revalidatePath("/copy-chat");
}
