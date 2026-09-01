import "server-only";
import { prisma } from "./prisma";
import { generateText, parseJsonResponse } from "./anthropic";

/**
 * Builds the system prompt invisibly — brand voice notes, a few sample
 * captions in the client's own words, and their most recently approved
 * drafts as few-shot examples — so the user never has to re-explain tone
 * every time (scope doc: "pulls brand voice notes + past captions +
 * mood board data, assembles into the system prompt... invisibly").
 */
async function buildSystemPrompt(clientId: string, clientName: string): Promise<string> {
  const [brandVoice, approved] = await Promise.all([
    prisma.brandVoice.findUnique({ where: { clientId } }),
    prisma.draft.findMany({ where: { clientId, status: "APPROVED" }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const lines = [
    `You are a social media copywriter writing captions for "${clientName}".`,
    "Write short, natural captions a real small-business social account would post — no hashtag spam, no generic marketing fluff.",
  ];

  if (brandVoice?.toneNotes) lines.push(`Brand voice notes: ${brandVoice.toneNotes}`);

  const sampleCaptions = brandVoice?.sampleCaptions.split("\n").map((s) => s.trim()).filter(Boolean) ?? [];
  if (sampleCaptions.length > 0) {
    lines.push("Sample captions in this client's own voice:");
    lines.push(...sampleCaptions.map((c) => `- ${c}`));
  }

  if (approved.length > 0) {
    lines.push("Captions this client has approved before (match this style):");
    lines.push(...approved.map((d) => `- ${d.content}`));
  }

  lines.push('Respond with ONLY a JSON object in this exact shape, no other text: {"drafts": ["caption one", "caption two", "caption three"]}');
  return lines.join("\n");
}

export async function generateCaptionDrafts({
  clientId,
  clientName,
  topic,
  platform,
}: {
  clientId: string;
  clientName: string;
  topic: string;
  platform: string;
}): Promise<{ drafts: string[] } | { error: string }> {
  const system = await buildSystemPrompt(clientId, clientName);
  const prompt = `What this post is about: ${topic}${platform ? `\nPlatform: ${platform}` : ""}\n\nWrite 3 distinct caption options.`;

  const result = await generateText({ system, prompt, maxTokens: 1200 });
  if ("error" in result) return result;

  const parsed = parseJsonResponse<{ drafts: string[] }>(result.text);
  if (!parsed || !Array.isArray(parsed.drafts) || parsed.drafts.length === 0) {
    return { error: "Couldn't parse a response from the AI — try again." };
  }
  return { drafts: parsed.drafts.slice(0, 3).map((d) => String(d)) };
}
