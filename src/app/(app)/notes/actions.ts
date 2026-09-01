"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { storeImage } from "@/lib/storage";

type NoteFormState = { error?: string; saved?: boolean } | undefined;

export async function createNoteAction(_prevState: NoteFormState, formData: FormData): Promise<NoteFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };

  const clientId = String(formData.get("clientId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const tagsRaw = String(formData.get("tags") ?? "");
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (!clientId || !body) return { error: "Pick a client and write a note." };

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client || client.workspaceId !== user.workspaceId) return { error: "Pick a client and write a note." };

  let imageUrl: string | undefined;
  const imageFile = formData.get("image");
  if (imageFile instanceof File && imageFile.size > 0) {
    imageUrl = await storeImage(imageFile);
  }

  await prisma.note.create({
    data: { workspaceId: user.workspaceId, clientId, body, tags, imageUrl },
  });

  revalidatePath("/notes");
  return { saved: true };
}

export async function deleteNoteAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") ?? "");
  await prisma.note.deleteMany({ where: { id, workspaceId: user.workspaceId } });
  revalidatePath("/notes");
}
