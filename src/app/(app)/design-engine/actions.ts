"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { findPreset, blankDoc, guessHeadline, templateCategories } from "@/lib/canvas-doc/presets";
import { isValidDoc, type CanvasDoc } from "@/lib/canvas-doc/types";
import type { Prisma } from "@prisma/client";

/**
 * Starts a new design — from a template preset, or blank — as a private
 * draft in the VA's own studio. Does NOT send anything, it just opens the
 * free-form editor.
 */
export async function createDesignAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const templateId = String(formData.get("templateId") ?? "");
  const category = String(formData.get("category") ?? "");
  const promptText = String(formData.get("promptText") ?? "");

  let doc: CanvasDoc;
  let name: string;
  let usedTemplateId: string | null = null;

  const preset = templateId ? findPreset(templateId) : undefined;
  if (preset) {
    doc = structuredClone(preset.doc);
    name = preset.name;
    usedTemplateId = preset.id;
  } else if ((templateCategories as readonly string[]).includes(category)) {
    doc = blankDoc(category as (typeof templateCategories)[number]);
    name = `Untitled ${category.toLowerCase()}`;
  } else {
    redirect("/design-engine");
  }

  // Reflect the VA's prompt in whatever reads as the design's main
  // headline (its largest text element) — everything else about the
  // template stays the same real, pre-built layout.
  if (promptText.trim()) {
    const headline = guessHeadline(promptText);
    let target: (typeof doc.elements)[number] | undefined;
    for (const el of doc.elements) {
      if (el.type === "text" && (!target || (target.type === "text" && el.fontSize > target.fontSize))) target = el;
    }
    if (target && target.type === "text") target.text = headline;
  }

  const design = await prisma.design.create({
    data: {
      templateId: usedTemplateId,
      name,
      doc: doc as unknown as Prisma.InputJsonValue,
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
  const docRaw = String(formData.get("doc") ?? "");

  if (!id) return { error: "Design not found." };

  let doc: CanvasDoc;
  try {
    doc = JSON.parse(docRaw);
  } catch {
    return { error: "Couldn't read the design's content." };
  }
  if (!isValidDoc(doc)) return { error: "Couldn't read the design's content." };

  await prisma.design.update({
    where: { id },
    data: { name: name || "Untitled design", doc: doc as unknown as Prisma.InputJsonValue },
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
 * The explicit, separate "send" step: snapshots the canvas's current
 * content into a DesignApproval so the client sees exactly what's on
 * screen — nothing reaches them until this runs.
 */
export async function sendDesignAction(_prevState: { error?: string } | undefined, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };

  const designId = String(formData.get("designId") ?? "");
  const clientId = String(formData.get("clientId") ?? "");
  const docRaw = String(formData.get("doc") ?? "");
  if (!designId || !clientId) return { error: "Pick a client first." };

  let doc: CanvasDoc;
  try {
    doc = JSON.parse(docRaw);
  } catch {
    return { error: "Couldn't read the design's content." };
  }
  if (!isValidDoc(doc)) return { error: "Couldn't read the design's content." };

  const design = await prisma.design.findUnique({ where: { id: designId } });
  if (!design) return { error: "Design not found." };

  // Sending snapshots whatever is currently on the canvas — including
  // edits made but not yet explicitly saved — and persists that same
  // content back onto the draft, so nothing gets silently lost.
  await prisma.$transaction([
    prisma.design.update({
      where: { id: designId },
      data: { doc: doc as unknown as Prisma.InputJsonValue, status: "SENT" },
    }),
    prisma.designApproval.create({
      data: {
        clientId,
        templateId: design.templateId,
        designId: design.id,
        doc: doc as unknown as Prisma.InputJsonValue,
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
