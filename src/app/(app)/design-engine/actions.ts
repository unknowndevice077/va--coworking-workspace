"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { findPreset, blankDoc, applyPromptHeadline, applyLogo, matchPresets, templatePresets, templateCategories } from "@/lib/canvas-doc/presets";
import { normalizeDoc, type CanvasDoc } from "@/lib/canvas-doc/types";
import type { Prisma } from "@prisma/client";

const MIN_CANVAS = 100;
const MAX_CANVAS = 4000;

function readCustomSize(formData: FormData): { width: number; height: number } | null {
  const w = Number(formData.get("customWidth"));
  const h = Number(formData.get("customHeight"));
  if (!Number.isFinite(w) || !Number.isFinite(h)) return null;
  if (w < MIN_CANVAS || h < MIN_CANVAS || w > MAX_CANVAS || h > MAX_CANVAS) return null;
  return { width: Math.round(w), height: Math.round(h) };
}

/**
 * Starts a new design — from a template preset, a custom size, or a
 * category's default blank size — as a private draft in the VA's own
 * studio. Does NOT send anything, it just opens the free-form editor.
 */
export async function createDesignAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const templateId = String(formData.get("templateId") ?? "");
  const category = String(formData.get("category") ?? "");
  const promptText = String(formData.get("promptText") ?? "");
  const customSize = readCustomSize(formData);

  let doc: CanvasDoc;
  let name: string;
  let usedTemplateId: string | null = null;

  const preset = templateId ? findPreset(templateId) : undefined;
  if (preset) {
    doc = structuredClone(preset.doc);
    name = preset.name;
    usedTemplateId = preset.id;
  } else if (customSize) {
    doc = { width: customSize.width, height: customSize.height, pages: [{ id: "page-1", background: "#ffffff", elements: [] }] };
    name = `Untitled design (${customSize.width}×${customSize.height})`;
  } else if ((templateCategories as readonly string[]).includes(category)) {
    doc = blankDoc(category as (typeof templateCategories)[number]);
    name = `Untitled ${category.toLowerCase()}`;
  } else {
    redirect("/design-engine");
  }

  applyPromptHeadline(doc, promptText);

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

/**
 * The "auto design" flow: match the best template to a prompt, drop an
 * uploaded logo into its brand-mark slot (or a corner badge, if it
 * doesn't have one), and reflect the prompt in the headline — all in one
 * step, so a VA lands straight in a filled-out draft instead of a blank
 * template. This is smart template-matching + placement, not generative
 * AI — no image or copy is invented, everything placed already existed
 * in the template or was uploaded.
 */
export async function autoDesignAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const promptText = String(formData.get("promptText") ?? "").trim();
  if (!promptText) redirect("/design-engine/auto");

  const category = String(formData.get("category") ?? "All");
  const cat = (templateCategories as readonly string[]).includes(category) ? (category as (typeof templateCategories)[number]) : "All";
  const [best] = matchPresets(promptText, { category: cat, limit: 1 });
  const preset = best ?? templatePresets[0];
  const doc = structuredClone(preset.doc);

  const logoFile = formData.get("logo");
  if (logoFile instanceof File && logoFile.size > 0) {
    const buf = await logoFile.arrayBuffer();
    const dataUrl = `data:${logoFile.type || "image/png"};base64,${Buffer.from(buf).toString("base64")}`;
    applyLogo(doc, dataUrl);
  }

  applyPromptHeadline(doc, promptText);

  const design = await prisma.design.create({
    data: {
      templateId: preset.id,
      name: preset.name,
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
