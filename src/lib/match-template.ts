import { designTemplates, type DesignTemplate, type TemplateCategory } from "./design-templates";

/**
 * Honest "Smart Templates" matcher: scores every template in the library
 * against the words in a plain-text prompt and returns the best matches.
 * This is deliberately NOT a call to a generative model — it's fast,
 * free, and deterministic keyword matching over a curated template
 * library, which is the whole point of the feature (see design-templates.ts).
 */
export function matchTemplates(
  prompt: string,
  opts: { category?: TemplateCategory | "All"; limit?: number } = {}
): DesignTemplate[] {
  const { category = "All", limit = 8 } = opts;

  const words = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const pool =
    category === "All"
      ? designTemplates
      : designTemplates.filter((t) => t.category === category);

  const scored = pool.map((template) => {
    let score = 0;
    for (const keyword of template.keywords) {
      const kw = keyword.toLowerCase();
      if (kw.includes(" ")) {
        // multi-word keyword: match as a substring of the raw prompt
        if (prompt.toLowerCase().includes(kw)) score += 3;
      } else if (words.includes(kw)) {
        score += 2;
      }
    }
    return { template, score };
  });

  const matched = scored.filter((s) => s.score > 0);
  const ranked = (matched.length > 0 ? matched : scored).sort(
    (a, b) => b.score - a.score
  );

  return ranked.slice(0, limit).map((s) => s.template);
}

/** A short, human title guessed from the prompt — used as the template's headline slot. */
export function guessHeadline(prompt: string): string {
  const cleaned = prompt.trim();
  if (!cleaned) return "Your headline here";
  const words = cleaned.split(/\s+/).slice(0, 6).join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}
