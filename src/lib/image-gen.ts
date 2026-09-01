import "server-only";

// The image-rendering half of Design Assist / AI Remix — deliberately kept
// behind this one function so swapping providers later (per the scope
// doc's own note: "research current providers when you actually reach
// this phase") only ever touches this file. Scaffolded against OpenAI's
// Images API (gpt-image-1) since it's the most broadly available option
// today; zero-config-safe like every other integration here — with no
// OPENAI_API_KEY, isImageGenConfigured() is false and every caller hides
// its "AI generate" entry point instead of erroring.
export function isImageGenConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

export async function generateImage({
  prompt,
  width,
  height,
}: {
  prompt: string;
  width: number;
  height: number;
}): Promise<{ dataUrl: string } | { error: string }> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { error: "Image generation isn't configured yet." };

  // gpt-image-1 accepts a fixed set of sizes — pick the closest aspect ratio.
  const ratio = width / height;
  const size = ratio > 1.15 ? "1536x1024" : ratio < 0.87 ? "1024x1536" : "1024x1024";

  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        size,
        n: 1,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[image-gen] OpenAI request failed:", res.status, body);
      return { error: `Image generation failed (${res.status}).` };
    }

    const json = (await res.json()) as { data?: { b64_json?: string; url?: string }[] };
    const first = json.data?.[0];
    if (first?.b64_json) {
      return { dataUrl: `data:image/png;base64,${first.b64_json}` };
    }
    if (first?.url) {
      return { dataUrl: first.url };
    }
    return { error: "Image generation returned no image." };
  } catch (err) {
    console.error("[image-gen] request failed:", err);
    return { error: "Image generation failed unexpectedly." };
  }
}
