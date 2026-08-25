"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { findTemplate, guessHeadline, defaultFieldValues } from "@/lib/graphic-templates";
import type { Prisma } from "@prisma/client";

/**
 * Starts a new design from a template — a private draft in the VA's own
 * studio, not anything a client can see. This is the "Design this" action
 * from the template library: it does NOT send anything, it just opens the
 * editor with the template's real content pre-filled.
 */
export async function createDesignAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const templateId = String(formData.get("templateId") ?? "");
  const promptText = String(formData.get("promptText") ?? "");
  const template = findTemplate(templateId);
  if (!template) redirect("/design-engine");

  const fields = defaultFieldValues(template);
  if (promptText.trim()) {
    fields[template.primaryField] = guessHeadline(promptText);
  }

  const design = await prisma.design.create({
    data: {
      templateId: template.id,
      name: template.name,
      fields: fields as Prisma.InputJsonValue,
      hue: template.defaultHue,
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
  const hue = Number(formData.get("hue") ?? 0);
  const fieldsRaw = String(formData.get("fields") ?? "{}");

  if (!id) return { error: "Design not found." };

  let fields: Record<string, string>;
  try {
    fields = JSON.parse(fieldsRaw);
  } catch {
    return { error: "Couldn't read the design's content." };
  }

  await prisma.design.update({
    where: { id },
    data: {
      name: name || "Untitled design",
      fields: fields as Prisma.InputJsonValue,
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
  const hue = Number(formData.get("hue") ?? 0);
  const fieldsRaw = String(formData.get("fields") ?? "{}");
  if (!designId || !clientId) return { error: "Pick a client first." };

  let fields: Record<string, string>;
  try {
    fields = JSON.parse(fieldsRaw);
  } catch {
    return { error: "Couldn't read the design's content." };
  }

  const design = await prisma.design.findUnique({ where: { id: designId } });
  if (!design) return { error: "Design not found." };

  // Sending snapshots whatever is currently on the canvas — including
  // edits made but not yet explicitly saved — and persists that same
  // content back onto the draft, so nothing typed gets silently lost.
  await prisma.$transaction([
    prisma.design.update({
      where: { id: designId },
      data: { fields: fields as Prisma.InputJsonValue, hue: Number.isFinite(hue) ? hue : design.hue, status: "SENT" },
    }),
    prisma.designApproval.create({
      data: {
        clientId,
        templateId: design.templateId,
        designId: design.id,
        fields: fields as Prisma.InputJsonValue,
        hue: Number.isFinite(hue) ? hue : design.hue,
        promptText: design.promptText,
        status: "PENDING",
      },
    }),
  ]);

  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/design-engine/studio/${designId}`);
  revalidatePath("/design-engine/studio");
  redirect(`/clients/${clientId}`);
}
