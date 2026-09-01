import "server-only";
import { prisma } from "./prisma";
import { newElId, newPageId, type CanvasDoc } from "./canvas-doc/types";
import type { Prisma } from "@prisma/client";

/**
 * Wraps a generated image (from src/lib/image-gen.ts) as a full-bleed
 * single-element Design, ready to open in the existing CanvasEditor for
 * further editing — same reuse Auto Design relies on, just with one
 * ImageEl instead of a template's structured elements.
 */
export async function createDesignFromImage({
  workspaceId,
  name,
  promptText,
  width,
  height,
  dataUrl,
}: {
  workspaceId: string;
  name: string;
  promptText: string;
  width: number;
  height: number;
  dataUrl: string;
}) {
  const doc: CanvasDoc = {
    width,
    height,
    pages: [
      {
        id: newPageId(),
        background: "#ffffff",
        elements: [
          {
            id: newElId(),
            type: "image",
            src: dataUrl,
            x: 0,
            y: 0,
            w: width,
            h: height,
            rotation: 0,
            zIndex: 0,
            radius: 0,
          },
        ],
      },
    ],
  };

  return prisma.design.create({
    data: {
      workspaceId,
      templateId: null,
      name,
      doc: doc as unknown as Prisma.InputJsonValue,
      promptText,
      status: "DRAFT",
    },
  });
}
