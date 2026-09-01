import "server-only";
import Anthropic from "@anthropic-ai/sdk";

// Zero-config-safe AI: with no ANTHROPIC_API_KEY set, isAiConfigured() is
// false everywhere AI Copy Chat / Design Assist would render, so those
// features simply stay hidden — same pattern as Stripe/Resend elsewhere
// in this app (src/lib/stripe.ts, src/lib/mailer.ts).
export function isAiConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

let cached: Anthropic | null = null;
function getClient(): Anthropic | null {
  if (!isAiConfigured()) return null;
  if (!cached) cached = new Anthropic();
  return cached;
}

/**
 * One-shot text generation — used for both AI Copy Chat (caption drafts)
 * and Design Assist (structuring a design brief). Non-streaming: these are
 * short responses (a handful of captions, a short brief), well under the
 * point where streaming is needed to avoid HTTP timeouts.
 */
export async function generateText({
  system,
  prompt,
  maxTokens = 2000,
}: {
  system: string;
  prompt: string;
  maxTokens?: number;
}): Promise<{ text: string } | { error: string }> {
  const client = getClient();
  if (!client) return { error: "AI isn't configured yet." };

  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: maxTokens,
      thinking: { type: "adaptive" },
      system,
      messages: [{ role: "user", content: prompt }],
    });

    if (response.stop_reason === "refusal") {
      return { error: "Claude declined to generate this — try rephrasing." };
    }

    const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
    if (!textBlock?.text) return { error: "No response generated." };
    return { text: textBlock.text };
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return { error: "AI is misconfigured (invalid API key)." };
    }
    if (err instanceof Anthropic.RateLimitError) {
      return { error: "AI is rate-limited right now — try again in a moment." };
    }
    if (err instanceof Anthropic.APIError) {
      return { error: `AI request failed: ${err.message}` };
    }
    console.error("[anthropic] generateText failed:", err);
    return { error: "AI request failed unexpectedly." };
  }
}

/** Strips a ```json fenced code block if Claude wraps its JSON output in one, then parses. */
export function parseJsonResponse<T>(text: string): T | null {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}
