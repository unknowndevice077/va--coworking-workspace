"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { normalizeDoc } from "@/lib/canvas-doc/types";
import { remixFixed, type RemixStyleId } from "@/lib/remix";
import { generateImage } from "@/lib/image-gen";
import { createDesignFromImage } from "@/lib/design-assist";
import type { Prisma } from "@prisma/client";

async function loadOwnedDesign(id: string, workspaceId: string) {
  const design = await prisma.design.findUnique({ where: { id } });
  if (!design || design.workspaceId !== workspaceId) return null;
  const doc = normalizeDoc(design.doc);
  if (!doc) return null;
  return { design, doc };
}

/** Applies one fixed-palette Remix style as a new draft, leaving the original design untouched. */
export async function applyFixedRemixAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("designId") ?? "");
  const styleId = String(formData.get("styleId") ?? "") as RemixStyleId;
  const loaded = await loadOwnedDesign(id, user.workspaceId);
  if (!loaded) redirect("/design-engine/studio");

  const remixedDoc = remixFixed(loaded.doc, styleId);
  const created = await prisma.design.create({
    data: {
      workspaceId: user.workspaceId,
      templateId: loaded.design.templateId,
      name: `${loaded.design.name} (${styleId} remix)`,
      doc: remixedDoc as unknown as Prisma.InputJsonValue,
      promptText: loaded.design.promptText,
      status: "DRAFT",
    },
  });

  redirect(`/design-engine/studio/${created.id}`);
}

/** Generates 3 AI variations (real image-gen calls) and drops them into My Designs as new drafts. */
export async function generateAiRemixAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("designId") ?? "");
  const prompt = String(formData.get("prompt") ?? "").trim();
  const loaded = await loadOwnedDesign(id, user.workspaceId);
  if (!loaded) redirect("/design-engine/studio");
  if (!prompt) redirect(`/design-engine/studio/${id}/remix`);

  const variations = ["clean and modern", "bold and colorful", "elegant and minimal"];
  await Promise.all(
    variations.map(async (style) => {
      const result = await generateImage({
        prompt: `${prompt}, ${style} style, professional marketing graphic`,
        width: loaded.doc.width,
        height: loaded.doc.height,
      });
      if ("dataUrl" in result) {
        await createDesignFromImage({
          workspaceId: user.workspaceId,
          name: `${loaded.design.name} (AI: ${style})`,
          promptText: prompt,
          width: loaded.doc.width,
          height: loaded.doc.height,
          dataUrl: result.dataUrl,
        });
      }
    })
  );

  redirect("/design-engine/studio");
}
