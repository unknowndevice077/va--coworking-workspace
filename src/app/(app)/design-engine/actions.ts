"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { findPreset, blankDoc, guessHeadline, templateCategories } from "@/lib/canvas-doc/presets";
import { normalizeDoc, type CanvasDoc } from "@/lib/canvas-doc/types";
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
  // headline (its largest text element, on the first page) — everything
  // else about the template stays the same real, pre-built layout. Only
  // a real multi-word phrase qualifies: several templates have a bigger
  // *value* than their headline (a $350,000 price, a 32px stat number, a
  // giant decorative quote mark) and none of those read as a headline.
  if (promptText.trim()) {
    const headline = guessHeadline(promptText);
    const elements = doc.pages[0].elements;
    const looksLikeHeadline = (text: string) => text.trim().length >= 4 && /\s/.test(text.trim());
    let target: (typeof elements)[number] | undefined;
    for (const el of elements) {
      if (
        el.type === "text" &&
        looksLikeHeadline(el.text) &&
        (!target || (target.type === "text" && el.fontSize > target.fontSize))
      ) {
        target = el;
      }
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

  let parsed: unknown;
  try {
    parsed = JSON.parse(docRaw);
  } catch {
    return { error: "Couldn't read the design's content." };
  }
  const doc = normalizeDoc(parsed);
  if (!doc) return { error: "Couldn't read the design's content." };

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
 * The explicit, separate "send" step, kicked off from the My Designs
 * library (not the canvas editor — the editor is design-and-save only).
 * Snapshots the design's last-saved content into a DesignApproval so the
 * client sees exactly that — nothing reaches them until this runs. A
 * plain form action (no useActionState) since it's fired from a card in
 * a list, not a dedicated form with its own inline error state.
 */
export async function sendDesignAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const designId = String(formData.get("designId") ?? "");
  const clientId = String(formData.get("clientId") ?? "");
  if (!designId || !clientId) redirect("/design-engine/studio");

  const design = await prisma.design.findUnique({ where: { id: designId } });
  const doc = design ? normalizeDoc(design.doc) : null;
  if (!design || !doc) redirect("/design-engine/studio");

  await prisma.$transaction([
    prisma.design.update({
      where: { id: designId },
      data: { status: "SENT" },
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
  revalidatePath("/design-engine/sent");
  redirect("/design-engine/sent");
}
