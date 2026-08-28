"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { blankVideoDoc, normalizeVideoDoc } from "@/lib/video-doc/types";
import type { Prisma } from "@prisma/client";

/** Starts a new, blank video project and opens it in the editor. */
export async function createVideoProjectAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const orientation = String(formData.get("orientation") ?? "portrait");
  const doc = blankVideoDoc();
  if (orientation === "landscape") {
    doc.width = 1920;
    doc.height = 1080;
  } else if (orientation === "square") {
    doc.width = 1080;
    doc.height = 1080;
  }

  const project = await prisma.videoProject.create({
    data: { workspaceId: user.workspaceId, name: "Untitled video", doc: doc as unknown as Prisma.InputJsonValue },
  });

  redirect(`/videos/${project.id}`);
}

/** Saves edits to a video project. */
export async function updateVideoProjectAction(
  _prevState: { error?: string; saved?: boolean } | undefined,
  formData: FormData
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const docRaw = String(formData.get("doc") ?? "");
  if (!id) return { error: "Video not found." };

  let parsed: unknown;
  try {
    parsed = JSON.parse(docRaw);
  } catch {
    return { error: "Couldn't read the video's content." };
  }
  const doc = normalizeVideoDoc(parsed);
  if (!doc) return { error: "Couldn't read the video's content." };

  const existing = await prisma.videoProject.findUnique({ where: { id } });
  if (!existing || existing.workspaceId !== user.workspaceId) return { error: "Video not found." };

  await prisma.videoProject.update({
    where: { id },
    data: { name: name || "Untitled video", doc: doc as unknown as Prisma.InputJsonValue },
  });

  revalidatePath(`/videos/${id}`);
  revalidatePath("/videos");
  return { saved: true };
}

/** Deletes a video project. */
export async function deleteVideoProjectAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") ?? "");
  await prisma.videoProject.deleteMany({ where: { id, workspaceId: user.workspaceId } }).catch(() => {});
  revalidatePath("/videos");
  redirect("/videos");
}
