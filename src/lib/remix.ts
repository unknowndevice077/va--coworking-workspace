import type { CanvasDoc } from "./canvas-doc/types";

// Fixed-library Remix: recolors a design by mapping its existing palette
// (whatever distinct colors it actually uses, sorted dark-to-light) onto
// one of a few curated mood palettes, preserving contrast/hierarchy —
// structure and copy stay identical, only the color story changes. No AI,
// no cost, deterministic — three genuinely different looks per template.

export const REMIX_STYLES = [
  {
    id: "bold",
    label: "Bold",
    description: "Vibrant violet, high contrast",
    palette: ["#1a0b2e", "#4c1d95", "#7c3aed", "#a78bfa", "#ede9fe", "#fdfcff"],
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Grayscale, quiet and clean",
    palette: ["#0a0a0a", "#404040", "#737373", "#a3a3a3", "#e5e5e5", "#fafafa"],
  },
  {
    id: "warm",
    label: "Warm",
    description: "Terracotta and amber",
    palette: ["#451a03", "#9a3412", "#ea580c", "#fb923c", "#fed7aa", "#fffbeb"],
  },
] as const;

export type RemixStyleId = (typeof REMIX_STYLES)[number]["id"];

function hexLuminance(hex: string): number {
  const h = hex.replace("#", "");
  if (h.length !== 6 || !/^[0-9a-f]{6}$/i.test(h)) return 0.5; // non-hex color — neutral fallback, still gets remapped
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function collectColors(doc: CanvasDoc): string[] {
  const set = new Set<string>();
  for (const page of doc.pages) {
    set.add(page.background);
    for (const el of page.elements) {
      if (el.type === "text") set.add(el.color);
      else if (el.type === "shape") {
        set.add(el.fill);
        if (el.stroke) set.add(el.stroke);
      } else if (el.type === "icon") {
        set.add(el.color);
        if (el.background) set.add(el.background);
      }
    }
  }
  return Array.from(set);
}

function buildColorMap(colors: string[], palette: readonly string[]): Map<string, string> {
  const sorted = [...colors].sort((a, b) => hexLuminance(b) - hexLuminance(a)); // darkest first
  const map = new Map<string, string>();
  sorted.forEach((c, i) => {
    const t = sorted.length <= 1 ? 0 : i / (sorted.length - 1);
    const idx = Math.round(t * (palette.length - 1));
    map.set(c, palette[idx]);
  });
  return map;
}

export function remixFixed(doc: CanvasDoc, styleId: RemixStyleId): CanvasDoc {
  const style = REMIX_STYLES.find((s) => s.id === styleId) ?? REMIX_STYLES[0];
  const map = buildColorMap(collectColors(doc), style.palette);
  const remap = (c: string) => map.get(c) ?? c;

  return {
    ...doc,
    pages: doc.pages.map((page) => ({
      ...page,
      background: remap(page.background),
      elements: page.elements.map((el) => {
        if (el.type === "text") return { ...el, color: remap(el.color) };
        if (el.type === "shape") return { ...el, fill: remap(el.fill), stroke: el.stroke ? remap(el.stroke) : el.stroke };
        if (el.type === "icon") return { ...el, color: remap(el.color), background: el.background ? remap(el.background) : el.background };
        return el; // images carry no flat color to remap
      }),
    })),
  };
}
