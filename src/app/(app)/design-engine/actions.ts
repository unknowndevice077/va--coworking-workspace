"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { designTemplates } from "@/lib/design-templates";
import { guessHeadline } from "@/lib/match-template";

/**
 * Starts a new design from a template — a private draft in the VA's own
 * studio, not anything a client can see. This is the "Use" action from the
 * template library: it does NOT send anything, it just opens the editor.
 */
export async function createDesignAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const templateId = String(formData.get("templateId") ?? "");
  const promptText = String(formData.get("promptText") ?? "");
  const template = designTemplates.find((t) => t.id === templateId);
  if (!template) redirect("/design-engine");

  const design = await prisma.design.create({
    data: {
      templateId: template.id,
      name: template.name,
      headline: promptText.trim() ? guessHeadline(promptText) : template.headline,
      sub: template.sub ?? null,
      tag: template.tag ?? null,
      hue: template.hue,
      promptText,
      status: "DRAFT",
    },
  });

  redirect(`/design-engine/studio/${design.id}`);
}

/** Saves edits to a draft. The draft stays private until explicitly sent. */
export async function updateDesignAction(
  _prevState: { error?: string; saved?: boolean } | undefined,
  formData: FormData
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const headline = String(formData.get("headline") ?? "").trim();
  const sub = String(formData.get("sub") ?? "").trim();
  const tag = String(formData.get("tag") ?? "").trim();
  const hue = Number(formData.get("hue") ?? 0);

  if (!id) return { error: "Design not found." };
  if (!headline) return { error: "Give it a headline before saving." };

  await prisma.design.update({
    where: { id },
    data: {
      name: name || "Untitled design",
      headline,
      sub: sub || null,
      tag: tag || null,
      hue: Number.isFinite(hue) ? hue : 0,
    },
  });

  revalidatePath(`/design-engine/studio/${id}`);
  revalidatePath("/design-engine/studio");
  return { saved: true };
}

/** Deletes a draft that was never sent. */
export async function deleteDesignAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") ?? "");
  await prisma.design.delete({ where: { id } }).catch(() => {});
  revalidatePath("/design-engine/studio");
  redirect("/design-engine/studio");
}

/**
 * The explicit, separate "send" step: snapshots the draft's current content
 * into a DesignApproval so the client sees exactly what's in the editor —
 * nothing reaches them until this runs.
 */
export async function sendDesignAction(_prevState: { error?: string } | undefined, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };

  const designId = String(formData.get("designId") ?? "");
  const clientId = String(formData.get("clientId") ?? "");
  if (!designId || !clientId) return { error: "Pick a client first." };

  const design = await prisma.design.findUnique({ where: { id: designId } });
  if (!design) return { error: "Design not found." };

  await prisma.$transaction([
    prisma.designApproval.create({
      data: {
        clientId,
        templateId: design.templateId,
        designId: design.id,
        headline: design.headline,
        sub: design.sub,
        tag: design.tag,
        hue: design.hue,
        promptText: design.promptText,
        status: "PENDING",
      },
    }),
    prisma.design.update({ where: { id: designId }, data: { status: "SENT" } }),
  ]);

  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/design-engine/studio/${designId}`);
  revalidatePath("/design-engine/studio");
  redirect(`/clients/${clientId}`);
}
