"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { generateDesignBrief, type DesignBrief } from "@/lib/design-brief";
import { isImageGenConfigured, generateImage } from "@/lib/image-gen";
import { createDesignFromImage } from "@/lib/design-assist";

type AssistState = { error?: string; brief?: DesignBrief } | undefined;

export async function generateDesignAssistAction(_prevState: AssistState, formData: FormData): Promise<AssistState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const description = String(formData.get("description") ?? "").trim();
  const width = Math.max(100, Math.min(4000, Number(formData.get("width") ?? 1080) || 1080));
  const height = Math.max(100, Math.min(4000, Number(formData.get("height") ?? 1080) || 1080));

  if (!description) return { error: "Describe what you need designed." };

  const briefResult = await generateDesignBrief({ description, width, height });
  if ("error" in briefResult) return { error: briefResult.error };

  if (!isImageGenConfigured()) {
    // Showcase mode: the reasoning half works end to end, the render half
    // just isn't wired to a provider yet — show the brief instead of failing.
    return { brief: briefResult.brief };
  }

  const imgResult = await generateImage({ prompt: briefResult.brief.imagePrompt, width, height });
  if ("error" in imgResult) return { error: imgResult.error, brief: briefResult.brief };

  const design = await createDesignFromImage({
    workspaceId: user.workspaceId,
    name: description.length > 60 ? `${description.slice(0, 57)}…` : description,
    promptText: description,
    width,
    height,
    dataUrl: imgResult.dataUrl,
  });

  redirect(`/design-engine/studio/${design.id}`);
}
