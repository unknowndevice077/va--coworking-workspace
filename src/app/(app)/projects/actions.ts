"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const STAGES = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"] as const;

export async function moveProjectAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const projectId = String(formData.get("projectId"));
  const direction = String(formData.get("direction"));

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.workspaceId !== user.workspaceId) return;

  const idx = STAGES.indexOf(project.status as (typeof STAGES)[number]);
  const nextIdx = direction === "forward" ? Math.min(idx + 1, STAGES.length - 1) : Math.max(idx - 1, 0);
  await prisma.project.update({ where: { id: projectId }, data: { status: STAGES[nextIdx] } });

  revalidatePath("/projects");
}

export async function logTimeAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const projectId = String(formData.get("projectId"));

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.workspaceId !== user.workspaceId) return;

  await prisma.timeEntry.create({
    data: { workspaceId: user.workspaceId, projectId, userId: user.id, minutes: 15 },
  });
  revalidatePath("/projects");
  revalidatePath("/dashboard");
}

export async function createProjectAction(_prevState: { error?: string } | undefined, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };

  const clientId = String(formData.get("clientId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const dueLabel = String(formData.get("dueLabel") ?? "").trim();

  if (!clientId || !title) return { error: "Pick a client and add a title." };

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client || client.workspaceId !== user.workspaceId) return { error: "Pick a client and add a title." };

  await prisma.project.create({
    data: { workspaceId: user.workspaceId, clientId, title, dueLabel: dueLabel || null, status: "TODO" },
  });

  revalidatePath("/projects");
  redirect("/projects");
}
