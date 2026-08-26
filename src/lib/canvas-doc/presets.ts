import type { CanvasDoc, DesignElement, DistributiveOmit, TemplateCategory, TemplatePreset } from "./types";

export type { TemplateCategory } from "./types";

type RawEl = DistributiveOmit<DesignElement, "id" | "zIndex" | "rotation"> & { rotation?: number };

function finalize(width: number, height: number, background: string, raw: RawEl[]): CanvasDoc {
  return {
    width,
    height,
    background,
    elements: raw.map((r, i) => ({ ...r, id: `preset_${i}`, zIndex: i, rotation: r.rotation ?? 0 }) as DesignElement),
  };
}

// ---------- Local Tip Pubmat (Social Post, 1080x1080) ----------
const p1 = { deep: "#1f4b36", mid: "#3e7a5c", tint: "#eaf3ec", tint2: "#d8ebe0", ink: "#5c6b63" };
const localTipPubmat: TemplatePreset = {
  id: "local-tip-pubmat",
  name: "Local Tip Pubmat",
  category: "Social Post",
  keywords: ["tip", "insurance", "real estate", "local", "pubmat", "educational", "square", "instagram"],
  doc: finalize(1080, 1080, "#ffffff", [
    { type: "shape", shape: "rect", x: 0, y: 0, w: 1080, h: 110, fill: p1.deep, radius: 0, opacity: 1 },
    { type: "icon", x: 40, y: 31, w: 48, h: 48, icon: "pin", color: "#ffffff" },
    { type: "text", x: 100, y: 30, w: 500, h: 48, text: "Canton Insurance Tip", fontFamily: "display", fontSize: 22, fontWeight: 700, color: "#ffffff", align: "left", lineHeight: 1.2 },
    { type: "shape", shape: "rect", x: 800, y: 30, w: 240, h: 44, fill: "#3e6b52", radius: 22, opacity: 1 },
    { type: "text", x: 810, y: 42, w: 220, h: 24, text: "Daily Tip · Canton, SD", fontFamily: "body", fontSize: 13, fontWeight: 700, color: "#ffffff", align: "center", lineHeight: 1.2 },
    { type: "text", x: 60, y: 150, w: 960, h: 120, text: "Homeowners insurance quotes can vary by hundreds, depending on fire district and distance.", fontFamily: "display", fontSize: 34, fontWeight: 700, color: p1.deep, align: "left", lineHeight: 1.2 },
    { type: "text", x: 60, y: 280, w: 800, h: 40, text: "Why two similar homes can have drastically different insurance premiums.", fontFamily: "body", fontSize: 16, fontWeight: 400, color: p1.ink, align: "left", lineHeight: 1.4 },
    { type: "shape", shape: "rect", x: 60, y: 350, w: 960, h: 220, fill: p1.tint, radius: 14, opacity: 1 },
    { type: "icon", x: 300, y: 400, w: 60, h: 60, icon: "home", color: p1.deep },
    { type: "icon", x: 680, y: 400, w: 60, h: 60, icon: "home", color: p1.mid },
    { type: "shape", shape: "line", x: 380, y: 428, w: 280, h: 3, fill: p1.deep, radius: 0, opacity: 0.6 },
    { type: "text", x: 265, y: 470, w: 130, h: 24, text: "FIRE STATION", fontFamily: "body", fontSize: 12, fontWeight: 700, color: p1.deep, align: "center", lineHeight: 1.2 },
    { type: "text", x: 645, y: 470, w: 130, h: 24, text: "HOME", fontFamily: "body", fontSize: 12, fontWeight: 700, color: p1.deep, align: "center", lineHeight: 1.2 },
    { type: "shape", shape: "rect", x: 60, y: 600, w: 320, h: 140, fill: p1.deep, radius: 14, opacity: 1 },
    { type: "text", x: 85, y: 615, w: 270, h: 60, text: "$300", fontFamily: "display", fontSize: 40, fontWeight: 700, color: "#ffffff", align: "left", lineHeight: 1 },
    { type: "text", x: 85, y: 680, w: 270, h: 50, text: "less per year to insure in city limits — same purchase price", fontFamily: "body", fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.85)", align: "left", lineHeight: 1.3 },
    { type: "shape", shape: "rect", x: 400, y: 600, w: 620, h: 140, fill: p1.tint2, radius: 14, opacity: 1, stroke: p1.mid, strokeWidth: 1.5 },
    { type: "text", x: 430, y: 650, w: 560, h: 60, text: "Get an insurance quote before you make an offer, not after.", fontFamily: "display", fontSize: 18, fontWeight: 600, color: p1.deep, align: "left", lineHeight: 1.3 },
    { type: "shape", shape: "rect", x: 0, y: 980, w: 1080, h: 100, fill: p1.deep, radius: 0, opacity: 1 },
    { type: "text", x: 60, y: 1000, w: 300, h: 24, text: "[Agent Name]", fontFamily: "display", fontSize: 15, fontWeight: 700, color: "#ffffff", align: "left", lineHeight: 1.2 },
    { type: "text", x: 60, y: 1030, w: 300, h: 20, text: "[Brokerage] · [Phone]", fontFamily: "body", fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.75)", align: "left", lineHeight: 1.2 },
    { type: "text", x: 780, y: 1015, w: 240, h: 24, text: "@[Instagram handle]", fontFamily: "body", fontSize: 13, fontWeight: 600, color: "#ffffff", align: "right", lineHeight: 1.2 },
  ]),
};

// ---------- Event Flyer (Flyer, 1080x1350) ----------
const p2 = { deep: "#5c1f2e", mid: "#8a3a44", tint: "#fbeef0", tint2: "#f6dde1" };
const eventFlyer: TemplatePreset = {
  id: "event-flyer",
  name: "Event Flyer",
  category: "Flyer",
  keywords: ["event", "flyer", "poster", "open house", "workshop", "launch party", "rsvp", "date"],
  doc: finalize(1080, 1350, "#ffffff", [
    { type: "shape", shape: "rect", x: 0, y: 0, w: 1080, h: 90, fill: p2.deep, radius: 0, opacity: 1 },
    { type: "icon", x: 40, y: 28, w: 34, h: 34, icon: "sparkle", color: "#ffffff" },
    { type: "text", x: 90, y: 28, w: 500, h: 34, text: "Brightleaf Studio", fontFamily: "display", fontSize: 18, fontWeight: 700, color: "#ffffff", align: "left", lineHeight: 1.2 },
    { type: "shape", shape: "rect", x: 60, y: 150, w: 150, h: 150, fill: p2.deep, radius: 18, opacity: 1 },
    { type: "text", x: 60, y: 165, w: 150, h: 80, text: "14", fontFamily: "display", fontSize: 54, fontWeight: 700, color: "#ffffff", align: "center", lineHeight: 1 },
    { type: "text", x: 60, y: 245, w: 150, h: 30, text: "SAT · SEP", fontFamily: "body", fontSize: 15, fontWeight: 700, color: "#ffffff", align: "center", lineHeight: 1 },
    { type: "text", x: 240, y: 175, w: 780, h: 110, text: "Fall Open House", fontFamily: "display", fontSize: 42, fontWeight: 700, color: p2.deep, align: "left", lineHeight: 1.15 },
    { type: "shape", shape: "line", x: 60, y: 340, w: 960, h: 2, fill: p2.tint2, radius: 0, opacity: 1 },
    { type: "icon", x: 60, y: 368, w: 40, h: 40, icon: "clock", color: p2.mid, background: p2.tint },
    { type: "text", x: 120, y: 378, w: 400, h: 30, text: "1:00 – 4:00 PM", fontFamily: "body", fontSize: 17, fontWeight: 500, color: p2.deep, align: "left", lineHeight: 1.2 },
    { type: "shape", shape: "line", x: 60, y: 430, w: 960, h: 2, fill: p2.tint2, radius: 0, opacity: 1 },
    { type: "icon", x: 60, y: 458, w: 40, h: 40, icon: "pin", color: p2.mid, background: p2.tint },
    { type: "text", x: 120, y: 468, w: 600, h: 30, text: "412 Maple Ave, Canton", fontFamily: "body", fontSize: 17, fontWeight: 500, color: p2.deep, align: "left", lineHeight: 1.2 },
    { type: "shape", shape: "rect", x: 60, y: 540, w: 960, h: 640, fill: p2.tint, radius: 16, opacity: 1 },
    { type: "shape", shape: "rect", x: 0, y: 1250, w: 1080, h: 100, fill: p2.mid, radius: 0, opacity: 1 },
    { type: "text", x: 0, y: 1280, w: 1080, h: 40, text: "RSVP at brightleafstudio.com/openhouse", fontFamily: "display", fontSize: 20, fontWeight: 600, color: "#ffffff", align: "center", lineHeight: 1.2 },
  ]),
};

// ---------- Icon Lockup (Logo, 1080x1080) ----------
const p3 = { deep: "#163a4d", mid: "#2f6b82" };
const iconLockup: TemplatePreset = {
  id: "icon-lockup",
  name: "Icon Lockup",
  category: "Logo",
  keywords: ["logo", "brand", "mark", "lockup", "icon", "startup", "modern"],
  doc: finalize(1080, 1080, "#ffffff", [
    { type: "icon", x: 470, y: 260, w: 140, h: 140, icon: "sparkle", color: "#ffffff", background: p3.deep },
    { type: "text", x: 290, y: 430, w: 500, h: 60, text: "Hexagon Co.", fontFamily: "display", fontSize: 40, fontWeight: 700, color: p3.deep, align: "center", lineHeight: 1 },
    { type: "text", x: 290, y: 500, w: 500, h: 30, text: "DESIGN & STRATEGY", fontFamily: "body", fontSize: 14, fontWeight: 600, color: p3.mid, align: "center", lineHeight: 1 },
    { type: "shape", shape: "rect", x: 0, y: 760, w: 540, h: 320, fill: p3.deep, radius: 0, opacity: 1 },
    { type: "icon", x: 40, y: 875, w: 32, h: 32, icon: "sparkle", color: "#ffffff" },
    { type: "text", x: 90, y: 878, w: 300, h: 30, text: "Hexagon Co.", fontFamily: "display", fontSize: 17, fontWeight: 700, color: "#ffffff", align: "left", lineHeight: 1.2 },
    { type: "icon", x: 580, y: 875, w: 32, h: 32, icon: "sparkle", color: p3.deep },
    { type: "text", x: 630, y: 878, w: 300, h: 30, text: "Hexagon Co.", fontFamily: "display", fontSize: 17, fontWeight: 700, color: p3.deep, align: "left", lineHeight: 1.2 },
  ]),
};

// ---------- Modern Business Card (Business Card, 1050x600) ----------
const p4 = { deep: "#123b35", mid: "#1f6f5c" };
const bizCardModern: TemplatePreset = {
  id: "biz-card-modern",
  name: "Modern Business Card",
  category: "Business Card",
  keywords: ["business card", "card", "contact", "professional", "corporate"],
  doc: finalize(1050, 600, "#ffffff", [
    { type: "shape", shape: "rect", x: 0, y: 0, w: 380, h: 600, fill: p4.deep, radius: 0, opacity: 1 },
    { type: "icon", x: 40, y: 40, w: 46, h: 46, icon: "briefcase", color: "#ffffff", background: "rgba(255,255,255,0.14)" },
    { type: "text", x: 40, y: 110, w: 300, h: 60, text: "Node Labs", fontFamily: "display", fontSize: 20, fontWeight: 700, color: "#ffffff", align: "left", lineHeight: 1.25 },
    { type: "text", x: 420, y: 210, w: 560, h: 50, text: "Avery Chen", fontFamily: "display", fontSize: 26, fontWeight: 700, color: p4.deep, align: "left", lineHeight: 1.1 },
    { type: "text", x: 420, y: 265, w: 560, h: 30, text: "Founder & Creative Director", fontFamily: "body", fontSize: 14.5, fontWeight: 600, color: p4.mid, align: "left", lineHeight: 1.2 },
    { type: "icon", x: 420, y: 328, w: 22, h: 22, icon: "phone", color: p4.mid },
    { type: "text", x: 455, y: 328, w: 400, h: 26, text: "(605) 555-0148", fontFamily: "body", fontSize: 14, fontWeight: 400, color: "#3a3a36", align: "left", lineHeight: 1.2 },
    { type: "icon", x: 420, y: 363, w: 22, h: 22, icon: "mail", color: p4.mid },
    { type: "text", x: 455, y: 363, w: 400, h: 26, text: "avery@nodelabs.co", fontFamily: "body", fontSize: 14, fontWeight: 400, color: "#3a3a36", align: "left", lineHeight: 1.2 },
    { type: "icon", x: 420, y: 398, w: 22, h: 22, icon: "globe", color: p4.mid },
    { type: "text", x: 455, y: 398, w: 400, h: 26, text: "nodelabs.co", fontFamily: "body", fontSize: 14, fontWeight: 400, color: "#3a3a36", align: "left", lineHeight: 1.2 },
  ]),
};

// ---------- Title Slide (Presentation, 1920x1080) ----------
const p5 = { bg: "#0f2a44", mid: "#3f6d99" };
const titleSlide: TemplatePreset = {
  id: "title-slide",
  name: "Title Slide",
  category: "Presentation",
  keywords: ["presentation", "slide", "deck", "title", "pitch", "keynote"],
  doc: finalize(1920, 1080, p5.bg, [
    { type: "shape", shape: "ellipse", x: 1350, y: 240, w: 620, h: 620, fill: p5.mid, radius: 0, opacity: 0.18 },
    { type: "shape", shape: "ellipse", x: 1500, y: 390, w: 320, h: 320, fill: p5.mid, radius: 0, opacity: 0.3 },
    { type: "text", x: 140, y: 280, w: 800, h: 30, text: "Q4 STRATEGY REVIEW", fontFamily: "body", fontSize: 15, fontWeight: 700, color: "#bcd3e8", align: "left", lineHeight: 1.2 },
    { type: "text", x: 140, y: 320, w: 1050, h: 170, text: "Where we're taking the brand next", fontFamily: "display", fontSize: 64, fontWeight: 700, color: "#ffffff", align: "left", lineHeight: 1.1 },
    { type: "text", x: 140, y: 500, w: 780, h: 90, text: "A look at what worked, what didn't, and the plan for next quarter.", fontFamily: "body", fontSize: 22, fontWeight: 400, color: "rgba(255,255,255,0.78)", align: "left", lineHeight: 1.5 },
    { type: "shape", shape: "line", x: 140, y: 610, w: 44, h: 3, fill: p5.mid, radius: 0, opacity: 1 },
    { type: "text", x: 200, y: 600, w: 300, h: 30, text: "Jamie Rios", fontFamily: "body", fontSize: 16, fontWeight: 700, color: "#ffffff", align: "left", lineHeight: 1.2 },
    { type: "text", x: 420, y: 600, w: 300, h: 30, text: "September 2026", fontFamily: "body", fontSize: 15, fontWeight: 400, color: "rgba(255,255,255,0.7)", align: "left", lineHeight: 1.2 },
  ]),
};

export const templatePresets: TemplatePreset[] = [localTipPubmat, eventFlyer, iconLockup, bizCardModern, titleSlide];

export const templateCategories: TemplateCategory[] = ["Logo", "Social Post", "Flyer", "Business Card", "Presentation"];

export function findPreset(id: string): TemplatePreset | undefined {
  return templatePresets.find((t) => t.id === id);
}

const BLANK_SIZE: Record<TemplateCategory, { w: number; h: number; bg: string }> = {
  "Social Post": { w: 1080, h: 1080, bg: "#ffffff" },
  Flyer: { w: 1080, h: 1350, bg: "#ffffff" },
  Logo: { w: 1080, h: 1080, bg: "#ffffff" },
  "Business Card": { w: 1050, h: 600, bg: "#ffffff" },
  Presentation: { w: 1920, h: 1080, bg: "#ffffff" },
};

/** A truly blank canvas at the right size for a category — start from nothing. */
export function blankDoc(category: TemplateCategory): CanvasDoc {
  const { w, h, bg } = BLANK_SIZE[category];
  return { width: w, height: h, background: bg, elements: [] };
}

export function matchPresets(prompt: string, opts: { category?: TemplateCategory | "All"; limit?: number } = {}): TemplatePreset[] {
  const { category = "All", limit = 12 } = opts;
  const words = prompt.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  const pool = category === "All" ? templatePresets : templatePresets.filter((t) => t.category === category);
  const scored = pool.map((t) => {
    let score = 0;
    for (const kw of t.keywords) {
      const k = kw.toLowerCase();
      if (k.includes(" ")) {
        if (prompt.toLowerCase().includes(k)) score += 3;
      } else if (words.includes(k)) {
        score += 2;
      }
    }
    return { t, score };
  });
  const matched = scored.filter((s) => s.score > 0);
  const ranked = (matched.length > 0 ? matched : scored).sort((a, b) => b.score - a.score);
  return ranked.slice(0, limit).map((s) => s.t);
}

/** A short, human title guessed from the prompt — used to prefill a new design's main headline. */
export function guessHeadline(prompt: string): string {
  const cleaned = prompt.trim();
  if (!cleaned) return "";
  const words = cleaned.split(/\s+/).slice(0, 8).join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}
