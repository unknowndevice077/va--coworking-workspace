import "server-only";
import { generateText, parseJsonResponse } from "./anthropic";

export interface DesignBrief {
  layout: string;
  copy: string;
  colorDirection: string;
  imagePrompt: string;
}

/**
 * Design Assist's reasoning half: Claude writes a structured creative
 * brief — layout logic, copy, color direction, reasoning only, never the
 * actual image (scope doc). `imagePrompt` is a single prompt that folds
 * the rest together, handed to src/lib/image-gen.ts to render.
 */
export async function generateDesignBrief({
  description,
  width,
  height,
}: {
  description: string;
  width: number;
  height: number;
}): Promise<{ brief: DesignBrief } | { error: string }> {
  const system = [
    "You are a senior graphic designer writing a structured creative brief for an AI image generator.",
    "Respond with ONLY a JSON object in this exact shape, no other text:",
    '{"layout": "how elements should be arranged", "copy": "any headline or short text to include", "colorDirection": "the color palette and mood", "imagePrompt": "one detailed, self-contained prompt combining layout + copy + color direction, ready to hand directly to an image generator"}',
  ].join("\n");
  const prompt = `Design needed: ${description}\nCanvas dimensions: ${width}x${height}px (design accordingly — note if it should read as portrait, landscape, or square).`;

  const result = await generateText({ system, prompt, maxTokens: 1000 });
  if ("error" in result) return result;

  const parsed = parseJsonResponse<DesignBrief>(result.text);
  if (!parsed?.imagePrompt) return { error: "Couldn't structure a brief — try again." };
  return { brief: parsed };
}
