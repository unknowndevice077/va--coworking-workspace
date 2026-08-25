import type { GraphicTemplateDef, TemplateCategory } from "./types";
import { localTipPubmat } from "./templates/LocalTipPubmat";
import { boldQuoteCard } from "./templates/BoldQuoteCard";
import { eventFlyer } from "./templates/EventFlyer";
import { logoLockup } from "./templates/LogoLockup";
import { logoMonogram } from "./templates/LogoMonogram";
import { bizCardModern } from "./templates/BizCardModern";
import { titleSlide } from "./templates/TitleSlide";

export type { GraphicTemplateDef, FieldDef, GraphicProps, TemplateCategory } from "./types";
export { defaultFieldValues } from "./types";
export { paletteFromHue } from "./palette";

// The Smart Design Template Engine's library. Every entry is a real,
// hand-built graphic — not a color block with a headline slot — that
// renders identically in a thumbnail, the studio editor, and an exported
// PNG. Small and curated on purpose: quality over quantity.
export const graphicTemplates: GraphicTemplateDef[] = [
  localTipPubmat,
  boldQuoteCard,
  eventFlyer,
  logoLockup,
  logoMonogram,
  bizCardModern,
  titleSlide,
];

export const templateCategories: TemplateCategory[] = ["Logo", "Social Post", "Flyer", "Business Card", "Presentation"];

export function findTemplate(id: string): GraphicTemplateDef | undefined {
  return graphicTemplates.find((t) => t.id === id);
}

/**
 * Honest "Smart Templates" matcher: scores every template in the library
 * against the words in a plain-text prompt and returns the best matches.
 * Deliberately NOT a call to a generative model — fast, free, deterministic
 * keyword matching over a curated template library.
 */
export function matchTemplates(
  prompt: string,
  opts: { category?: TemplateCategory | "All"; limit?: number } = {}
): GraphicTemplateDef[] {
  const { category = "All", limit = 12 } = opts;

  const words = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const pool = category === "All" ? graphicTemplates : graphicTemplates.filter((t) => t.category === category);

  const scored = pool.map((template) => {
    let score = 0;
    for (const keyword of template.keywords) {
      const kw = keyword.toLowerCase();
      if (kw.includes(" ")) {
        if (prompt.toLowerCase().includes(kw)) score += 3;
      } else if (words.includes(kw)) {
        score += 2;
      }
    }
    return { template, score };
  });

  const matched = scored.filter((s) => s.score > 0);
  const ranked = (matched.length > 0 ? matched : scored).sort((a, b) => b.score - a.score);

  return ranked.slice(0, limit).map((s) => s.template);
}

/** A short, human title guessed from the prompt — used to prefill a template's primary text field. */
export function guessHeadline(prompt: string): string {
  const cleaned = prompt.trim();
  if (!cleaned) return "";
  const words = cleaned.split(/\s+/).slice(0, 8).join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}
