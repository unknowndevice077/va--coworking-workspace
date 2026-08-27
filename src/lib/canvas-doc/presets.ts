import { newElId } from "./types";
import type { CanvasDoc, CanvasPage, DesignElement, DistributiveOmit, TemplateCategory, TemplatePreset } from "./types";
import type { GIconName } from "./icons";

export type { TemplateCategory } from "./types";

type RawEl = DistributiveOmit<DesignElement, "id" | "zIndex" | "rotation"> & { rotation?: number };

function finalizeElements(prefix: string, raw: RawEl[]): DesignElement[] {
  return raw.map((r, i) => ({ ...r, id: `${prefix}_${i}`, zIndex: i, rotation: r.rotation ?? 0 }) as DesignElement);
}

/** A single-page doc — the common case (a flyer, a logo, a business card, one social post). */
function finalize(width: number, height: number, background: string, raw: RawEl[]): CanvasDoc {
  return {
    width,
    height,
    pages: [{ id: "page-1", background, elements: finalizeElements("preset", raw) }],
  };
}

/** A multi-page doc — a real deck, one page per slide. */
function finalizeDeck(width: number, height: number, slides: { background: string; raw: RawEl[] }[]): CanvasDoc {
  return {
    width,
    height,
    pages: slides.map((s, i) => ({ id: `page-${i + 1}`, background: s.background, elements: finalizeElements(`preset_${i}`, s.raw) })),
  };
}

// ---------- Local Tip Pubmat (Social Post, 1080x1080) ----------
const p1 = { deep: "#1f4b36", mid: "#3e7a5c", tint: "#eaf3ec", tint2: "#d8ebe0", ink: "#5c6b63" };

// Shared header/footer for the real-estate pubmat family below — same
// agent brand mark, tag pill and contact footer on every one of them.
function reHeader(tag: string, tagWidth = 200): RawEl[] {
  return [
    { type: "shape", shape: "rect", x: 0, y: 0, w: 1080, h: 96, fill: p1.deep, radius: 0, opacity: 1 },
    { type: "icon", x: 40, y: 33, w: 30, h: 30, icon: "home", color: "#ffffff" },
    { type: "text", x: 82, y: 36, w: 400, h: 26, text: "[Agent Name]", fontFamily: "display", fontSize: 16, fontWeight: 700, color: "#ffffff", align: "left", lineHeight: 1.2 },
    { type: "shape", shape: "rect", x: 1040 - tagWidth, y: 28, w: tagWidth, h: 40, fill: "rgba(255,255,255,0.16)", radius: 20, opacity: 1, stroke: "rgba(255,255,255,0.35)", strokeWidth: 1 },
    { type: "text", x: 1040 - tagWidth, y: 40, w: tagWidth, h: 20, text: tag, fontFamily: "body", fontSize: 12, fontWeight: 700, color: "#ffffff", align: "center", lineHeight: 1 },
  ];
}
function reFooter(): RawEl[] {
  return [
    { type: "shape", shape: "rect", x: 0, y: 980, w: 1080, h: 100, fill: p1.deep, radius: 0, opacity: 1 },
    { type: "text", x: 60, y: 1000, w: 300, h: 24, text: "[Agent Name]", fontFamily: "display", fontSize: 15, fontWeight: 700, color: "#ffffff", align: "left", lineHeight: 1.2 },
    { type: "text", x: 60, y: 1030, w: 300, h: 20, text: "[Brokerage] · [Phone]", fontFamily: "body", fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.75)", align: "left", lineHeight: 1.2 },
    { type: "text", x: 780, y: 1015, w: 240, h: 24, text: "@[Instagram handle]", fontFamily: "body", fontSize: 13, fontWeight: 600, color: "#ffffff", align: "right", lineHeight: 1.2 },
  ];
}
/** A tint-filled placeholder standing in for a photo the VA will drop in via the Uploads panel. */
function rePhotoPlaceholder(x: number, y: number, w: number, h: number): RawEl[] {
  return [
    { type: "shape", shape: "rect", x, y, w, h, fill: p1.tint, radius: 14, opacity: 1, stroke: p1.mid, strokeWidth: 2 },
    { type: "text", x, y: y + h / 2 - 12, w, h: 24, text: "Add a photo from Uploads →", fontFamily: "body", fontSize: 13, fontWeight: 700, color: p1.mid, align: "center", lineHeight: 1.2 },
  ];
}
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

// ============================================================
// Real-estate pubmat family (Social Post, 1080x1080) — same
// brand mark, palette and footer as Local Tip Pubmat above.
// ============================================================

// ---------- Just Listed ----------
const justListed: TemplatePreset = {
  id: "just-listed",
  name: "Just Listed",
  category: "Social Post",
  keywords: ["just listed", "listing", "new listing", "for sale", "real estate", "property", "pubmat"],
  doc: finalize(1080, 1080, "#ffffff", [
    ...reHeader("Just Listed"),
    ...rePhotoPlaceholder(60, 130, 960, 360),
    { type: "shape", shape: "ellipse", x: 60, y: 528, w: 10, h: 10, fill: p1.mid, radius: 0, opacity: 1 },
    { type: "text", x: 80, y: 503, w: 500, h: 50, text: "$350,000", fontFamily: "display", fontSize: 38, fontWeight: 700, color: p1.deep, align: "left", lineHeight: 1 },
    { type: "text", x: 60, y: 566, w: 700, h: 26, text: "123 Main St, Canton, SD", fontFamily: "body", fontSize: 16, fontWeight: 400, color: p1.ink, align: "left", lineHeight: 1.2 },
    { type: "shape", shape: "rect", x: 60, y: 610, w: 234, h: 92, fill: p1.tint, radius: 12, opacity: 1 },
    { type: "icon", x: 161, y: 622, w: 32, h: 32, icon: "bed", color: p1.deep },
    { type: "text", x: 60, y: 662, w: 234, h: 22, text: "4", fontFamily: "display", fontSize: 17, fontWeight: 700, color: p1.deep, align: "center", lineHeight: 1 },
    { type: "text", x: 60, y: 684, w: 234, h: 16, text: "BEDS", fontFamily: "body", fontSize: 11.5, fontWeight: 700, color: p1.ink, align: "center", lineHeight: 1 },
    { type: "shape", shape: "rect", x: 308, y: 610, w: 234, h: 92, fill: p1.tint, radius: 12, opacity: 1 },
    { type: "icon", x: 409, y: 622, w: 32, h: 32, icon: "bath", color: p1.deep },
    { type: "text", x: 308, y: 662, w: 234, h: 22, text: "2.5", fontFamily: "display", fontSize: 17, fontWeight: 700, color: p1.deep, align: "center", lineHeight: 1 },
    { type: "text", x: 308, y: 684, w: 234, h: 16, text: "BATHS", fontFamily: "body", fontSize: 11.5, fontWeight: 700, color: p1.ink, align: "center", lineHeight: 1 },
    { type: "shape", shape: "rect", x: 556, y: 610, w: 234, h: 92, fill: p1.tint, radius: 12, opacity: 1 },
    { type: "icon", x: 657, y: 622, w: 32, h: 32, icon: "sqft", color: p1.deep },
    { type: "text", x: 556, y: 662, w: 234, h: 22, text: "2,400", fontFamily: "display", fontSize: 17, fontWeight: 700, color: p1.deep, align: "center", lineHeight: 1 },
    { type: "text", x: 556, y: 684, w: 234, h: 16, text: "SQ FT", fontFamily: "body", fontSize: 11.5, fontWeight: 700, color: p1.ink, align: "center", lineHeight: 1 },
    { type: "shape", shape: "rect", x: 804, y: 610, w: 216, h: 92, fill: p1.tint, radius: 12, opacity: 1 },
    { type: "icon", x: 896, y: 622, w: 32, h: 32, icon: "lot", color: p1.deep },
    { type: "text", x: 804, y: 662, w: 216, h: 22, text: "0.3", fontFamily: "display", fontSize: 17, fontWeight: 700, color: p1.deep, align: "center", lineHeight: 1 },
    { type: "text", x: 804, y: 684, w: 216, h: 16, text: "ACRE LOT", fontFamily: "body", fontSize: 11.5, fontWeight: 700, color: p1.ink, align: "center", lineHeight: 1 },
    { type: "text", x: 60, y: 726, w: 960, h: 60, text: "A short, inviting description of the home's best features — natural light, updated kitchen, big backyard.", fontFamily: "body", fontSize: 15, fontWeight: 400, color: p1.ink, align: "left", lineHeight: 1.6 },
    { type: "shape", shape: "rect", x: 60, y: 820, w: 960, h: 84, fill: p1.tint2, radius: 14, opacity: 1, stroke: p1.mid, strokeWidth: 1.5 },
    { type: "text", x: 60, y: 850, w: 960, h: 30, text: "Schedule your private showing today →", fontFamily: "display", fontSize: 18, fontWeight: 600, color: p1.deep, align: "center", lineHeight: 1.2 },
    ...reFooter(),
  ]),
};

// ---------- Just Sold ----------
const justSold: TemplatePreset = {
  id: "just-sold",
  name: "Just Sold",
  category: "Social Post",
  keywords: ["just sold", "sold", "closed", "closing", "real estate", "property", "pubmat"],
  doc: finalize(1080, 1080, "#ffffff", [
    ...reHeader("Just Sold"),
    ...rePhotoPlaceholder(60, 130, 960, 280),
    { type: "text", x: 60, y: 432, w: 700, h: 34, text: "123 Main St, Canton, SD", fontFamily: "display", fontSize: 24, fontWeight: 700, color: p1.deep, align: "left", lineHeight: 1.1 },
    { type: "text", x: 60, y: 470, w: 700, h: 22, text: "Represented the Sellers", fontFamily: "body", fontSize: 14.5, fontWeight: 400, color: p1.ink, align: "left", lineHeight: 1.2 },
    { type: "shape", shape: "rect", x: 60, y: 512, w: 473, h: 110, fill: p1.tint, radius: 14, opacity: 1 },
    { type: "text", x: 82, y: 532, w: 300, h: 18, text: "LISTED AT", fontFamily: "body", fontSize: 11.5, fontWeight: 700, color: p1.mid, align: "left", lineHeight: 1 },
    { type: "text", x: 82, y: 556, w: 300, h: 36, text: "$339,000", fontFamily: "display", fontSize: 26, fontWeight: 700, color: p1.deep, align: "left", lineHeight: 1 },
    { type: "shape", shape: "rect", x: 547, y: 512, w: 473, h: 110, fill: p1.deep, radius: 14, opacity: 1 },
    { type: "text", x: 569, y: 532, w: 300, h: 18, text: "SOLD AT", fontFamily: "body", fontSize: 11.5, fontWeight: 700, color: "rgba(255,255,255,0.8)", align: "left", lineHeight: 1 },
    { type: "text", x: 569, y: 556, w: 300, h: 36, text: "$352,500", fontFamily: "display", fontSize: 26, fontWeight: 700, color: "#ffffff", align: "left", lineHeight: 1 },
    { type: "shape", shape: "rect", x: 60, y: 642, w: 260, h: 40, fill: p1.tint2, radius: 20, opacity: 1 },
    { type: "text", x: 60, y: 654, w: 260, h: 18, text: "6 days on market", fontFamily: "body", fontSize: 13, fontWeight: 600, color: p1.deep, align: "center", lineHeight: 1 },
    { type: "shape", shape: "rect", x: 332, y: 642, w: 230, h: 40, fill: p1.tint2, radius: 20, opacity: 1 },
    { type: "text", x: 332, y: 654, w: 230, h: 18, text: "+4% over asking", fontFamily: "body", fontSize: 13, fontWeight: 600, color: p1.deep, align: "center", lineHeight: 1 },
    { type: "text", x: 60, y: 706, w: 960, h: 50, text: "“Another wonderful family found their forever home in Canton.”", fontFamily: "serif", fontSize: 17, fontWeight: 500, color: p1.ink, align: "left", lineHeight: 1.5 },
    { type: "shape", shape: "rect", x: 60, y: 820, w: 960, h: 84, fill: p1.tint2, radius: 14, opacity: 1, stroke: p1.mid, strokeWidth: 1.5 },
    { type: "text", x: 80, y: 838, w: 920, h: 48, text: "Thinking of selling? Let's talk about what your home could sell for.", fontFamily: "display", fontSize: 17, fontWeight: 600, color: p1.deep, align: "center", lineHeight: 1.25 },
    ...reFooter(),
  ]),
};

// ---------- Open House ----------
const openHouse: TemplatePreset = {
  id: "open-house",
  name: "Open House",
  category: "Social Post",
  keywords: ["open house", "showing", "tour", "rsvp", "real estate", "property", "pubmat"],
  doc: finalize(1080, 1080, "#ffffff", [
    ...reHeader("Open House"),
    ...rePhotoPlaceholder(60, 130, 960, 280),
    { type: "text", x: 60, y: 432, w: 700, h: 34, text: "123 Main St, Canton, SD", fontFamily: "display", fontSize: 24, fontWeight: 700, color: p1.deep, align: "left", lineHeight: 1.1 },
    { type: "shape", shape: "rect", x: 60, y: 482, w: 473, h: 86, fill: p1.deep, radius: 14, opacity: 1 },
    { type: "icon", x: 80, y: 502, w: 32, h: 32, icon: "calendar", color: "#ffffff" },
    { type: "text", x: 126, y: 500, w: 300, h: 16, text: "DATE", fontFamily: "body", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.8)", align: "left", lineHeight: 1 },
    { type: "text", x: 126, y: 522, w: 380, h: 22, text: "Saturday, Sept 6", fontFamily: "display", fontSize: 16.5, fontWeight: 600, color: "#ffffff", align: "left", lineHeight: 1 },
    { type: "shape", shape: "rect", x: 547, y: 482, w: 473, h: 86, fill: p1.deep, radius: 14, opacity: 1 },
    { type: "icon", x: 567, y: 502, w: 32, h: 32, icon: "clock", color: "#ffffff" },
    { type: "text", x: 613, y: 500, w: 300, h: 16, text: "TIME", fontFamily: "body", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.8)", align: "left", lineHeight: 1 },
    { type: "text", x: 613, y: 522, w: 380, h: 22, text: "1:00 – 3:00 PM", fontFamily: "display", fontSize: 16.5, fontWeight: 600, color: "#ffffff", align: "left", lineHeight: 1 },
    { type: "shape", shape: "rect", x: 60, y: 588, w: 310, h: 90, fill: p1.tint, radius: 12, opacity: 1 },
    { type: "icon", x: 201, y: 602, w: 28, h: 28, icon: "bed", color: p1.deep },
    { type: "text", x: 60, y: 638, w: 310, h: 20, text: "4", fontFamily: "display", fontSize: 15, fontWeight: 700, color: p1.deep, align: "center", lineHeight: 1 },
    { type: "text", x: 60, y: 660, w: 310, h: 14, text: "BEDS", fontFamily: "body", fontSize: 11, fontWeight: 700, color: p1.ink, align: "center", lineHeight: 1 },
    { type: "shape", shape: "rect", x: 385, y: 588, w: 310, h: 90, fill: p1.tint, radius: 12, opacity: 1 },
    { type: "icon", x: 526, y: 602, w: 28, h: 28, icon: "bath", color: p1.deep },
    { type: "text", x: 385, y: 638, w: 310, h: 20, text: "2.5", fontFamily: "display", fontSize: 15, fontWeight: 700, color: p1.deep, align: "center", lineHeight: 1 },
    { type: "text", x: 385, y: 660, w: 310, h: 14, text: "BATHS", fontFamily: "body", fontSize: 11, fontWeight: 700, color: p1.ink, align: "center", lineHeight: 1 },
    { type: "shape", shape: "rect", x: 710, y: 588, w: 310, h: 90, fill: p1.tint, radius: 12, opacity: 1 },
    { type: "icon", x: 851, y: 602, w: 28, h: 28, icon: "sqft", color: p1.deep },
    { type: "text", x: 710, y: 638, w: 310, h: 20, text: "2,400", fontFamily: "display", fontSize: 15, fontWeight: 700, color: p1.deep, align: "center", lineHeight: 1 },
    { type: "text", x: 710, y: 660, w: 310, h: 14, text: "SQ FT", fontFamily: "body", fontSize: 11, fontWeight: 700, color: p1.ink, align: "center", lineHeight: 1 },
    { type: "shape", shape: "rect", x: 60, y: 820, w: 960, h: 84, fill: p1.tint2, radius: 14, opacity: 1, stroke: p1.mid, strokeWidth: 1.5 },
    { type: "text", x: 60, y: 852, w: 960, h: 30, text: "No RSVP needed — just stop by!", fontFamily: "display", fontSize: 18, fontWeight: 600, color: p1.deep, align: "center", lineHeight: 1.2 },
    ...reFooter(),
  ]),
};

// ---------- Market Update ----------
const marketUpdate: TemplatePreset = {
  id: "market-update",
  name: "Market Update",
  category: "Social Post",
  keywords: ["market update", "market report", "stats", "trends", "real estate", "pubmat"],
  doc: finalize(1080, 1080, "#ffffff", [
    ...reHeader("Market Update · Aug 2026", 300),
    { type: "text", x: 60, y: 130, w: 900, h: 80, text: "Canton, SD Market Snapshot", fontFamily: "display", fontSize: 27, fontWeight: 600, color: p1.deep, align: "left", lineHeight: 1.25 },
    { type: "shape", shape: "rect", x: 60, y: 230, w: 473, h: 140, fill: p1.tint, radius: 14, opacity: 1 },
    { type: "text", x: 82, y: 250, w: 400, h: 16, text: "MEDIAN SALE PRICE", fontFamily: "body", fontSize: 12, fontWeight: 600, color: p1.mid, align: "left", lineHeight: 1 },
    { type: "text", x: 82, y: 276, w: 400, h: 40, text: "$318K", fontFamily: "display", fontSize: 32, fontWeight: 700, color: p1.deep, align: "left", lineHeight: 1 },
    { type: "icon", x: 82, y: 322, w: 14, h: 14, icon: "trendUp", color: p1.deep },
    { type: "text", x: 102, y: 320, w: 300, h: 18, text: "+3.2% YoY", fontFamily: "body", fontSize: 12.5, fontWeight: 600, color: p1.deep, align: "left", lineHeight: 1 },
    { type: "shape", shape: "rect", x: 547, y: 230, w: 473, h: 140, fill: p1.tint, radius: 14, opacity: 1 },
    { type: "text", x: 569, y: 250, w: 400, h: 16, text: "AVG. DAYS ON MARKET", fontFamily: "body", fontSize: 12, fontWeight: 600, color: p1.mid, align: "left", lineHeight: 1 },
    { type: "text", x: 569, y: 276, w: 400, h: 40, text: "14", fontFamily: "display", fontSize: 32, fontWeight: 700, color: p1.deep, align: "left", lineHeight: 1 },
    { type: "icon", x: 569, y: 322, w: 14, h: 14, icon: "trendDown", color: "#8a5a3e" },
    { type: "text", x: 589, y: 320, w: 300, h: 18, text: "-2 vs last month", fontFamily: "body", fontSize: 12.5, fontWeight: 600, color: "#8a5a3e", align: "left", lineHeight: 1 },
    { type: "shape", shape: "rect", x: 60, y: 384, w: 473, h: 140, fill: p1.tint, radius: 14, opacity: 1 },
    { type: "text", x: 82, y: 404, w: 400, h: 16, text: "HOMES SOLD", fontFamily: "body", fontSize: 12, fontWeight: 600, color: p1.mid, align: "left", lineHeight: 1 },
    { type: "text", x: 82, y: 430, w: 400, h: 40, text: "42", fontFamily: "display", fontSize: 32, fontWeight: 700, color: p1.deep, align: "left", lineHeight: 1 },
    { type: "icon", x: 82, y: 476, w: 14, h: 14, icon: "trendUp", color: p1.deep },
    { type: "text", x: 102, y: 474, w: 300, h: 18, text: "+6 vs last month", fontFamily: "body", fontSize: 12.5, fontWeight: 600, color: p1.deep, align: "left", lineHeight: 1 },
    { type: "shape", shape: "rect", x: 547, y: 384, w: 473, h: 140, fill: p1.tint, radius: 14, opacity: 1 },
    { type: "text", x: 569, y: 404, w: 400, h: 16, text: "ACTIVE LISTINGS", fontFamily: "body", fontSize: 12, fontWeight: 600, color: p1.mid, align: "left", lineHeight: 1 },
    { type: "text", x: 569, y: 430, w: 400, h: 40, text: "61", fontFamily: "display", fontSize: 32, fontWeight: 700, color: p1.deep, align: "left", lineHeight: 1 },
    { type: "icon", x: 569, y: 476, w: 14, h: 14, icon: "trendDown", color: "#8a5a3e" },
    { type: "text", x: 589, y: 474, w: 300, h: 18, text: "-8% vs last month", fontFamily: "body", fontSize: 12.5, fontWeight: 600, color: "#8a5a3e", align: "left", lineHeight: 1 },
    { type: "text", x: 60, y: 560, w: 960, h: 60, text: "Inventory is tightening while prices hold steady — a good window for sellers, and a reason for buyers to move decisively on the right home.", fontFamily: "body", fontSize: 15, fontWeight: 400, color: p1.ink, align: "left", lineHeight: 1.6 },
    { type: "shape", shape: "rect", x: 60, y: 820, w: 960, h: 84, fill: p1.tint2, radius: 14, opacity: 1, stroke: p1.mid, strokeWidth: 1.5 },
    { type: "text", x: 60, y: 852, w: 960, h: 30, text: "Curious what this means for your home's value?", fontFamily: "display", fontSize: 17, fontWeight: 600, color: p1.deep, align: "center", lineHeight: 1.2 },
    ...reFooter(),
  ]),
};

// ---------- Client Testimonial ----------
const clientTestimonial: TemplatePreset = {
  id: "client-testimonial",
  name: "Client Testimonial",
  category: "Social Post",
  keywords: ["testimonial", "review", "client love", "quote", "rating", "real estate", "pubmat"],
  doc: finalize(1080, 1080, p1.tint, [
    ...reHeader("Client Love"),
    { type: "text", x: 0, y: 110, w: 1080, h: 110, text: "“", fontFamily: "serif", fontSize: 100, fontWeight: 500, color: p1.mid, align: "center", lineHeight: 1 },
    { type: "text", x: 140, y: 230, w: 800, h: 180, text: "Insert a client quote here about their experience — what made working together easy, and how it felt to finally get the keys.", fontFamily: "serif", fontSize: 28, fontWeight: 500, color: p1.deep, align: "center", lineHeight: 1.45 },
    { type: "icon", x: 459, y: 432, w: 26, h: 26, icon: "star", color: p1.deep, filled: true },
    { type: "icon", x: 493, y: 432, w: 26, h: 26, icon: "star", color: p1.deep, filled: true },
    { type: "icon", x: 527, y: 432, w: 26, h: 26, icon: "star", color: p1.deep, filled: true },
    { type: "icon", x: 561, y: 432, w: 26, h: 26, icon: "star", color: p1.deep, filled: true },
    { type: "icon", x: 595, y: 432, w: 26, h: 26, icon: "star", color: p1.deep, filled: true },
    { type: "shape", shape: "ellipse", x: 490, y: 490, w: 100, h: 100, fill: "#ffffff", radius: 0, opacity: 1, stroke: p1.mid, strokeWidth: 2 },
    { type: "icon", x: 515, y: 515, w: 50, h: 50, icon: "camera", color: p1.mid },
    { type: "text", x: 0, y: 610, w: 1080, h: 26, text: "[Client Name]", fontFamily: "display", fontSize: 17, fontWeight: 700, color: p1.deep, align: "center", lineHeight: 1.2 },
    { type: "text", x: 0, y: 638, w: 1080, h: 20, text: "Buyer in Canton, SD", fontFamily: "body", fontSize: 13.5, fontWeight: 400, color: p1.ink, align: "center", lineHeight: 1.2 },
    ...reFooter(),
  ]),
};

// ---------- Meet the Agent ----------
const meetTheAgent: TemplatePreset = {
  id: "meet-the-agent",
  name: "Meet the Agent",
  category: "Social Post",
  keywords: ["meet the agent", "about me", "bio", "headshot", "agent intro", "real estate", "pubmat"],
  doc: finalize(1080, 1080, "#ffffff", [
    ...reHeader("Meet Your Agent"),
    { type: "shape", shape: "ellipse", x: 445, y: 120, w: 190, h: 190, fill: p1.tint, radius: 0, opacity: 1, stroke: p1.mid, strokeWidth: 2 },
    { type: "icon", x: 515, y: 190, w: 50, h: 50, icon: "camera", color: p1.mid },
    { type: "text", x: 0, y: 330, w: 1080, h: 42, text: "[Agent Name]", fontFamily: "display", fontSize: 30, fontWeight: 700, color: p1.deep, align: "center", lineHeight: 1.1 },
    { type: "text", x: 0, y: 378, w: 1080, h: 22, text: "Realtor® · [Brokerage Name]", fontFamily: "body", fontSize: 14.5, fontWeight: 400, color: p1.ink, align: "center", lineHeight: 1.2 },
    { type: "text", x: 240, y: 414, w: 600, h: 80, text: "A short bio about your background, why you got into real estate, and what clients can expect when they work with you.", fontFamily: "body", fontSize: 15, fontWeight: 400, color: p1.ink, align: "center", lineHeight: 1.6 },
    { type: "shape", shape: "rect", x: 241, y: 512, w: 190, h: 84, fill: p1.tint, radius: 12, opacity: 1 },
    { type: "text", x: 241, y: 530, w: 190, h: 30, text: "8+", fontFamily: "display", fontSize: 22, fontWeight: 700, color: p1.deep, align: "center", lineHeight: 1 },
    { type: "text", x: 241, y: 564, w: 190, h: 20, text: "Years Experience", fontFamily: "body", fontSize: 11.5, fontWeight: 400, color: p1.ink, align: "center", lineHeight: 1.2 },
    { type: "shape", shape: "rect", x: 445, y: 512, w: 190, h: 84, fill: p1.tint, radius: 12, opacity: 1 },
    { type: "text", x: 445, y: 530, w: 190, h: 30, text: "120+", fontFamily: "display", fontSize: 22, fontWeight: 700, color: p1.deep, align: "center", lineHeight: 1 },
    { type: "text", x: 445, y: 564, w: 190, h: 20, text: "Homes Sold", fontFamily: "body", fontSize: 11.5, fontWeight: 400, color: p1.ink, align: "center", lineHeight: 1.2 },
    { type: "shape", shape: "rect", x: 649, y: 512, w: 190, h: 84, fill: p1.tint, radius: 12, opacity: 1 },
    { type: "text", x: 649, y: 530, w: 190, h: 30, text: "5.0★", fontFamily: "display", fontSize: 22, fontWeight: 700, color: p1.deep, align: "center", lineHeight: 1 },
    { type: "text", x: 649, y: 564, w: 190, h: 20, text: "Average Rating", fontFamily: "body", fontSize: 11.5, fontWeight: 400, color: p1.ink, align: "center", lineHeight: 1.2 },
    { type: "shape", shape: "rect", x: 240, y: 820, w: 600, h: 74, fill: p1.tint2, radius: 14, opacity: 1, stroke: p1.mid, strokeWidth: 1.5 },
    { type: "text", x: 240, y: 846, w: 600, h: 26, text: "Let's find your next home together.", fontFamily: "display", fontSize: 17, fontWeight: 600, color: p1.deep, align: "center", lineHeight: 1.2 },
    ...reFooter(),
  ]),
};

// ---------- Myth vs Fact ----------
const mythVsFact: TemplatePreset = {
  id: "myth-vs-fact",
  name: "Myth vs. Fact",
  category: "Social Post",
  keywords: ["myth vs fact", "myth", "fact", "education", "faq", "real estate", "pubmat"],
  doc: finalize(1080, 1080, "#ffffff", [
    ...reHeader("Myth vs Fact"),
    { type: "text", x: 130, y: 130, w: 820, h: 70, text: "“You need 20% down to buy a home.”", fontFamily: "display", fontSize: 26, fontWeight: 600, color: p1.deep, align: "center", lineHeight: 1.3 },
    { type: "shape", shape: "rect", x: 60, y: 230, w: 473, h: 550, fill: "#edede8", radius: 16, opacity: 1 },
    { type: "shape", shape: "ellipse", x: 82, y: 254, w: 28, h: 28, fill: "#dadad2", radius: 0, opacity: 1 },
    { type: "icon", x: 89, y: 261, w: 14, h: 14, icon: "xmark", color: "#7a7a72" },
    { type: "text", x: 118, y: 260, w: 200, h: 20, text: "MYTH", fontFamily: "display", fontSize: 15, fontWeight: 700, color: p1.deep, align: "left", lineHeight: 1 },
    { type: "text", x: 82, y: 296, w: 410, h: 200, text: "Buyers must put down 20% of the purchase price or they can't qualify for a mortgage.", fontFamily: "body", fontSize: 16, fontWeight: 400, color: "#7a7a72", align: "left", lineHeight: 1.55 },
    { type: "shape", shape: "rect", x: 547, y: 230, w: 473, h: 550, fill: p1.deep, radius: 16, opacity: 1 },
    { type: "shape", shape: "ellipse", x: 569, y: 254, w: 28, h: 28, fill: "rgba(255,255,255,0.18)", radius: 0, opacity: 1 },
    { type: "icon", x: 576, y: 261, w: 14, h: 14, icon: "check", color: "#ffffff" },
    { type: "text", x: 605, y: 260, w: 200, h: 20, text: "FACT", fontFamily: "display", fontSize: 15, fontWeight: 700, color: "#ffffff", align: "left", lineHeight: 1 },
    { type: "text", x: 569, y: 296, w: 410, h: 200, text: "Many loan programs allow as little as 3–5% down — and some, like VA loans, allow 0% for eligible buyers.", fontFamily: "body", fontSize: 16, fontWeight: 400, color: "#ffffff", align: "left", lineHeight: 1.55 },
    { type: "shape", shape: "rect", x: 60, y: 820, w: 960, h: 74, fill: p1.tint2, radius: 14, opacity: 1, stroke: p1.mid, strokeWidth: 1.5 },
    { type: "text", x: 60, y: 846, w: 960, h: 26, text: "Got a real estate question? Ask me anything.", fontFamily: "display", fontSize: 16, fontWeight: 600, color: p1.deep, align: "center", lineHeight: 1.2 },
    ...reFooter(),
  ]),
};

// ---------- Motivational Quote ----------
const motivationalQuote: TemplatePreset = {
  id: "motivational-quote",
  name: "Motivational Quote",
  category: "Social Post",
  keywords: ["motivational", "quote", "monday motivation", "inspiration", "real estate", "pubmat"],
  doc: finalize(1080, 1080, p1.deep, [
    { type: "shape", shape: "ellipse", x: 800, y: -140, w: 420, h: 420, fill: "none", radius: 0, opacity: 1, stroke: "rgba(255,255,255,0.18)", strokeWidth: 1 },
    { type: "shape", shape: "ellipse", x: -80, y: 920, w: 260, h: 260, fill: "none", radius: 0, opacity: 1, stroke: "rgba(255,255,255,0.18)", strokeWidth: 1 },
    { type: "text", x: 0, y: 160, w: 1080, h: 90, text: "“", fontFamily: "serif", fontSize: 70, fontWeight: 500, color: p1.mid, align: "center", lineHeight: 1 },
    { type: "text", x: 150, y: 270, w: 780, h: 220, text: "Home isn't just where you live — it's where your next chapter begins.", fontFamily: "serif", fontSize: 36, fontWeight: 500, color: "#ffffff", align: "center", lineHeight: 1.4 },
    { type: "shape", shape: "line", x: 516, y: 510, w: 48, h: 2, fill: "rgba(255,255,255,0.5)", radius: 0, opacity: 1 },
    { type: "text", x: 0, y: 528, w: 1080, h: 24, text: "Monday Motivation", fontFamily: "body", fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.75)", align: "center", lineHeight: 1.2 },
    { type: "icon", x: 486, y: 1008, w: 16, h: 16, icon: "home", color: "#ffffff" },
    { type: "text", x: 0, y: 1006, w: 1080, h: 20, text: "  [Agent Name] · [Brokerage]", fontFamily: "display", fontSize: 14, fontWeight: 600, color: "#ffffff", align: "center", lineHeight: 1.2 },
  ]),
};

// ---------- Product Announcement (Social Post, 1080x1080) ----------
const p6 = { deep: "#3a2a12", warm: "#c9772e", tint: "#fbeedd" };
const productAnnouncement: TemplatePreset = {
  id: "product-announcement",
  name: "Product Announcement",
  category: "Social Post",
  keywords: ["product", "launch", "announcement", "new", "sale", "drop", "instagram", "square"],
  doc: finalize(1080, 1080, p6.tint, [
    { type: "shape", shape: "rect", x: 0, y: 0, w: 1080, h: 1080, fill: p6.tint, radius: 0, opacity: 1 },
    { type: "shape", shape: "ellipse", x: -180, y: -180, w: 520, h: 520, fill: p6.warm, radius: 0, opacity: 0.18 },
    { type: "text", x: 90, y: 110, w: 500, h: 30, text: "NOW AVAILABLE", fontFamily: "body", fontSize: 15, fontWeight: 700, color: p6.warm, align: "left", lineHeight: 1.2 },
    { type: "text", x: 90, y: 150, w: 900, h: 260, text: "Meet the new Studio Collection", fontFamily: "display", fontSize: 64, fontWeight: 700, color: p6.deep, align: "left", lineHeight: 1.08 },
    { type: "text", x: 90, y: 420, w: 720, h: 70, text: "Hand-finished pieces, made to order, shipping worldwide starting this week.", fontFamily: "body", fontSize: 19, fontWeight: 400, color: "#6b5a44", align: "left", lineHeight: 1.5 },
    { type: "shape", shape: "rect", x: 90, y: 560, w: 900, h: 380, fill: "#ffffff", radius: 18, opacity: 1 },
    { type: "icon", x: 500, y: 690, w: 80, h: 80, icon: "sparkle", color: p6.warm },
    { type: "shape", shape: "rect", x: 90, y: 980, w: 300, h: 60, fill: p6.deep, radius: 30, opacity: 1 },
    { type: "text", x: 90, y: 998, w: 300, h: 26, text: "Shop the drop →", fontFamily: "body", fontSize: 15, fontWeight: 700, color: "#ffffff", align: "center", lineHeight: 1.2 },
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

// ---------- Workshop Poster (Flyer, 1080x1350) ----------
const p7 = { deep: "#0d3b3f", mid: "#1f7a80", cream: "#f3ede0" };
const workshopPoster: TemplatePreset = {
  id: "workshop-poster",
  name: "Workshop Poster",
  category: "Flyer",
  keywords: ["workshop", "class", "poster", "seminar", "training", "course", "sign up"],
  doc: finalize(1080, 1350, p7.deep, [
    { type: "text", x: 80, y: 90, w: 700, h: 30, text: "A HANDS-ON WORKSHOP", fontFamily: "body", fontSize: 15, fontWeight: 700, color: p7.mid, align: "left", lineHeight: 1.2 },
    { type: "text", x: 80, y: 130, w: 920, h: 260, text: "Intro to Watercolor", fontFamily: "display", fontSize: 66, fontWeight: 700, color: "#ffffff", align: "left", lineHeight: 1.08 },
    { type: "shape", shape: "line", x: 80, y: 350, w: 90, h: 4, fill: p7.mid, radius: 0, opacity: 1 },
    { type: "text", x: 80, y: 380, w: 760, h: 70, text: "No experience needed — all materials provided. Just bring your curiosity.", fontFamily: "body", fontSize: 19, fontWeight: 400, color: "rgba(255,255,255,0.8)", align: "left", lineHeight: 1.5 },
    { type: "shape", shape: "rect", x: 80, y: 500, w: 920, h: 500, fill: p7.cream, radius: 20, opacity: 1 },
    { type: "icon", x: 500, y: 660, w: 80, h: 80, icon: "sparkle", color: p7.deep },
    { type: "shape", shape: "line", x: 80, y: 1040, w: 920, h: 1, fill: "rgba(255,255,255,0.2)", radius: 0, opacity: 1 },
    { type: "icon", x: 80, y: 1070, w: 34, h: 34, icon: "calendar", color: p7.mid },
    { type: "text", x: 128, y: 1076, w: 400, h: 26, text: "Saturday, Sept 20 · 10 AM", fontFamily: "body", fontSize: 16, fontWeight: 500, color: "#ffffff", align: "left", lineHeight: 1.2 },
    { type: "icon", x: 80, y: 1116, w: 34, h: 34, icon: "pin", color: p7.mid },
    { type: "text", x: 128, y: 1122, w: 400, h: 26, text: "The Studio, 88 River St", fontFamily: "body", fontSize: 16, fontWeight: 500, color: "#ffffff", align: "left", lineHeight: 1.2 },
    { type: "shape", shape: "rect", x: 0, y: 1250, w: 1080, h: 100, fill: p7.mid, radius: 0, opacity: 1 },
    { type: "text", x: 0, y: 1280, w: 1080, h: 40, text: "Sign up at thestudio.com/watercolor", fontFamily: "display", fontSize: 20, fontWeight: 600, color: "#ffffff", align: "center", lineHeight: 1.2 },
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

// ---------- Wordmark Badge (Logo, 1080x1080) ----------
const p8 = { deep: "#3f2a1a", gold: "#b8863c" };
const wordmarkBadge: TemplatePreset = {
  id: "wordmark-badge",
  name: "Wordmark Badge",
  category: "Logo",
  keywords: ["logo", "badge", "wordmark", "circle", "seal", "artisan", "bakery", "coffee"],
  doc: finalize(1080, 1080, "#ffffff", [
    { type: "shape", shape: "ellipse", x: 190, y: 190, w: 700, h: 700, fill: "#ffffff", radius: 0, opacity: 1, stroke: p8.deep, strokeWidth: 3 },
    { type: "shape", shape: "ellipse", x: 230, y: 230, w: 620, h: 620, fill: "#ffffff", radius: 0, opacity: 1, stroke: p8.gold, strokeWidth: 1.5 },
    { type: "text", x: 290, y: 430, w: 500, h: 90, text: "Maren & Co.", fontFamily: "display", fontSize: 46, fontWeight: 700, color: p8.deep, align: "center", lineHeight: 1 },
    { type: "shape", shape: "line", x: 440, y: 530, w: 200, h: 2, fill: p8.gold, radius: 0, opacity: 1 },
    { type: "text", x: 290, y: 550, w: 500, h: 26, text: "ARTISAN GOODS · EST. 2019", fontFamily: "body", fontSize: 12.5, fontWeight: 600, color: p8.gold, align: "center", lineHeight: 1 },
    { type: "icon", x: 500, y: 300, w: 80, h: 80, icon: "leaf", color: p8.gold },
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

// ---------- Minimal Business Card (Business Card, 1050x600) ----------
const p9 = { ink: "#26221c", sub: "#8a8172", line: "#e4ddcd" };
const minimalCard: TemplatePreset = {
  id: "minimal-card",
  name: "Minimal Card",
  category: "Business Card",
  keywords: ["business card", "minimal", "clean", "light", "centered", "freelance"],
  doc: finalize(1050, 600, "#fbfaf6", [
    { type: "shape", shape: "rect", x: 40, y: 40, w: 970, h: 520, fill: "#fbfaf6", radius: 0, opacity: 1, stroke: p9.line, strokeWidth: 1.5 },
    { type: "text", x: 0, y: 210, w: 1050, h: 60, text: "SAGE & CO.", fontFamily: "display", fontSize: 30, fontWeight: 700, color: p9.ink, align: "center", lineHeight: 1 },
    { type: "shape", shape: "line", x: 475, y: 285, w: 100, h: 1.5, fill: p9.sub, radius: 0, opacity: 1 },
    { type: "text", x: 0, y: 305, w: 1050, h: 26, text: "Interior Design Studio", fontFamily: "body", fontSize: 14, fontWeight: 500, color: p9.sub, align: "center", lineHeight: 1 },
    { type: "text", x: 0, y: 420, w: 1050, h: 24, text: "hello@sageandco.com   ·   (415) 555-0192   ·   sageandco.com", fontFamily: "body", fontSize: 13, fontWeight: 400, color: p9.ink, align: "center", lineHeight: 1.2 },
  ]),
};

// ---------- Starter Pitch Deck (Presentation, 1920x1080, 3 pages) ----------
const p5 = { bg: "#0f2a44", mid: "#3f6d99" };
const pitchDeck: TemplatePreset = {
  id: "pitch-deck",
  name: "Starter Pitch Deck",
  category: "Presentation",
  keywords: ["presentation", "slide", "slides", "deck", "pitch deck", "title", "pitch", "keynote", "ppt", "powerpoint"],
  doc: finalizeDeck(1920, 1080, [
    {
      background: p5.bg,
      raw: [
        { type: "shape", shape: "ellipse", x: 1350, y: 240, w: 620, h: 620, fill: p5.mid, radius: 0, opacity: 0.18 },
        { type: "shape", shape: "ellipse", x: 1500, y: 390, w: 320, h: 320, fill: p5.mid, radius: 0, opacity: 0.3 },
        { type: "text", x: 140, y: 280, w: 800, h: 30, text: "Q4 STRATEGY REVIEW", fontFamily: "body", fontSize: 15, fontWeight: 700, color: "#bcd3e8", align: "left", lineHeight: 1.2 },
        { type: "text", x: 140, y: 320, w: 1050, h: 170, text: "Where we're taking the brand next", fontFamily: "display", fontSize: 64, fontWeight: 700, color: "#ffffff", align: "left", lineHeight: 1.1 },
        { type: "text", x: 140, y: 500, w: 780, h: 90, text: "A look at what worked, what didn't, and the plan for next quarter.", fontFamily: "body", fontSize: 22, fontWeight: 400, color: "rgba(255,255,255,0.78)", align: "left", lineHeight: 1.5 },
        { type: "shape", shape: "line", x: 140, y: 610, w: 44, h: 3, fill: p5.mid, radius: 0, opacity: 1 },
        { type: "text", x: 200, y: 600, w: 300, h: 30, text: "Jamie Rios", fontFamily: "body", fontSize: 16, fontWeight: 700, color: "#ffffff", align: "left", lineHeight: 1.2 },
        { type: "text", x: 420, y: 600, w: 300, h: 30, text: "September 2026", fontFamily: "body", fontSize: 15, fontWeight: 400, color: "rgba(255,255,255,0.7)", align: "left", lineHeight: 1.2 },
      ],
    },
    {
      background: "#ffffff",
      raw: [
        { type: "text", x: 140, y: 100, w: 800, h: 26, text: "AGENDA", fontFamily: "body", fontSize: 15, fontWeight: 700, color: p5.mid, align: "left", lineHeight: 1.2 },
        { type: "text", x: 140, y: 135, w: 1000, h: 80, text: "What we'll cover", fontFamily: "display", fontSize: 44, fontWeight: 700, color: p5.bg, align: "left", lineHeight: 1.1 },
        { type: "shape", shape: "line", x: 140, y: 300, w: 1640, h: 1.5, fill: "#e3e6eb", radius: 0, opacity: 1 },
        { type: "text", x: 140, y: 335, w: 60, h: 40, text: "01", fontFamily: "display", fontSize: 26, fontWeight: 700, color: p5.mid, align: "left", lineHeight: 1 },
        { type: "text", x: 240, y: 338, w: 900, h: 36, text: "Where we started the quarter", fontFamily: "display", fontSize: 24, fontWeight: 600, color: p5.bg, align: "left", lineHeight: 1.2 },
        { type: "shape", shape: "line", x: 140, y: 420, w: 1640, h: 1.5, fill: "#e3e6eb", radius: 0, opacity: 1 },
        { type: "text", x: 140, y: 455, w: 60, h: 40, text: "02", fontFamily: "display", fontSize: 26, fontWeight: 700, color: p5.mid, align: "left", lineHeight: 1 },
        { type: "text", x: 240, y: 458, w: 900, h: 36, text: "What we shipped and learned", fontFamily: "display", fontSize: 24, fontWeight: 600, color: p5.bg, align: "left", lineHeight: 1.2 },
        { type: "shape", shape: "line", x: 140, y: 540, w: 1640, h: 1.5, fill: "#e3e6eb", radius: 0, opacity: 1 },
        { type: "text", x: 140, y: 575, w: 60, h: 40, text: "03", fontFamily: "display", fontSize: 26, fontWeight: 700, color: p5.mid, align: "left", lineHeight: 1 },
        { type: "text", x: 240, y: 578, w: 900, h: 36, text: "The plan for next quarter", fontFamily: "display", fontSize: 24, fontWeight: 600, color: p5.bg, align: "left", lineHeight: 1.2 },
        { type: "shape", shape: "line", x: 140, y: 660, w: 1640, h: 1.5, fill: "#e3e6eb", radius: 0, opacity: 1 },
      ],
    },
    {
      background: p5.bg,
      raw: [
        { type: "shape", shape: "ellipse", x: -160, y: 600, w: 560, h: 560, fill: p5.mid, radius: 0, opacity: 0.18 },
        { type: "text", x: 140, y: 420, w: 1200, h: 130, text: "Thank you", fontFamily: "display", fontSize: 72, fontWeight: 700, color: "#ffffff", align: "left", lineHeight: 1 },
        { type: "text", x: 140, y: 560, w: 900, h: 40, text: "Questions? Let's talk.", fontFamily: "body", fontSize: 20, fontWeight: 400, color: "rgba(255,255,255,0.78)", align: "left", lineHeight: 1.4 },
        { type: "shape", shape: "line", x: 140, y: 640, w: 44, h: 3, fill: p5.mid, radius: 0, opacity: 1 },
        { type: "text", x: 200, y: 628, w: 400, h: 28, text: "jamie@brightleafstudio.com", fontFamily: "body", fontSize: 15, fontWeight: 600, color: "#ffffff", align: "left", lineHeight: 1.2 },
      ],
    },
  ]),
};

// ---------- Stat Highlight Slide (Presentation, 1920x1080) ----------
const p10 = { bg: "#231a12", warm: "#e0a458" };
const statHighlightSlide: TemplatePreset = {
  id: "stat-highlight-slide",
  name: "Stat Highlight Slide",
  category: "Presentation",
  keywords: ["slide", "stat", "number", "metric", "highlight", "results", "growth"],
  doc: finalize(1920, 1080, p10.bg, [
    { type: "text", x: 140, y: 140, w: 900, h: 30, text: "THIS QUARTER", fontFamily: "body", fontSize: 15, fontWeight: 700, color: p10.warm, align: "left", lineHeight: 1.2 },
    { type: "text", x: 130, y: 260, w: 900, h: 340, text: "3.4x", fontFamily: "display", fontSize: 240, fontWeight: 700, color: "#ffffff", align: "left", lineHeight: 1 },
    { type: "text", x: 140, y: 640, w: 800, h: 50, text: "growth in monthly active clients", fontFamily: "display", fontSize: 30, fontWeight: 600, color: "#ffffff", align: "left", lineHeight: 1.3 },
    { type: "text", x: 140, y: 710, w: 760, h: 60, text: "Compared to the same quarter last year, across every region.", fontFamily: "body", fontSize: 17, fontWeight: 400, color: "rgba(255,255,255,0.65)", align: "left", lineHeight: 1.5 },
    { type: "shape", shape: "ellipse", x: 1420, y: 200, w: 420, h: 420, fill: p10.warm, radius: 0, opacity: 0.14 },
  ]),
};

// ============================================================
// A general small-business pubmat family — same anatomy as the
// real-estate set (brand header, footer), deliberately varied palette
// and layout per business type so the library isn't one look repeated.
// ============================================================
function bizHeader(deep: string, icon: GIconName, tag: string, tagWidth = 200): RawEl[] {
  return [
    { type: "shape", shape: "rect", x: 0, y: 0, w: 1080, h: 96, fill: deep, radius: 0, opacity: 1 },
    { type: "icon", x: 40, y: 33, w: 30, h: 30, icon, color: "#ffffff" },
    { type: "text", x: 82, y: 36, w: 400, h: 26, text: "[Business Name]", fontFamily: "display", fontSize: 16, fontWeight: 700, color: "#ffffff", align: "left", lineHeight: 1.2 },
    { type: "shape", shape: "rect", x: 1040 - tagWidth, y: 28, w: tagWidth, h: 40, fill: "rgba(255,255,255,0.16)", radius: 20, opacity: 1, stroke: "rgba(255,255,255,0.35)", strokeWidth: 1 },
    { type: "text", x: 1040 - tagWidth, y: 40, w: tagWidth, h: 20, text: tag, fontFamily: "body", fontSize: 12, fontWeight: 700, color: "#ffffff", align: "center", lineHeight: 1 },
  ];
}
function bizFooter(deep: string): RawEl[] {
  return [
    { type: "shape", shape: "rect", x: 0, y: 980, w: 1080, h: 100, fill: deep, radius: 0, opacity: 1 },
    { type: "text", x: 60, y: 1000, w: 400, h: 24, text: "[Business Name]", fontFamily: "display", fontSize: 15, fontWeight: 700, color: "#ffffff", align: "left", lineHeight: 1.2 },
    { type: "text", x: 60, y: 1030, w: 400, h: 20, text: "[Website] · [Phone]", fontFamily: "body", fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.75)", align: "left", lineHeight: 1.2 },
    { type: "text", x: 780, y: 1015, w: 240, h: 24, text: "@[Instagram handle]", fontFamily: "body", fontSize: 13, fontWeight: 600, color: "#ffffff", align: "right", lineHeight: 1.2 },
  ];
}

// ---------- Cafe Daily Special (Social Post, 1080x1080) ----------
const p11 = { deep: "#3a2416", mid: "#8a5a35", tint: "#f5ead9", tint2: "#ecd9bd" };
const cafeDailySpecial: TemplatePreset = {
  id: "cafe-daily-special",
  name: "Cafe Daily Special",
  category: "Social Post",
  keywords: ["cafe", "coffee", "bakery", "daily special", "menu", "food", "drink"],
  doc: finalize(1080, 1080, "#ffffff", [
    ...bizHeader(p11.deep, "leaf", "Daily Special"),
    ...rePhotoPlaceholder(60, 130, 960, 380).map((el) => (el.type === "shape" ? { ...el, fill: p11.tint, stroke: p11.mid } : { ...el, color: p11.mid })),
    { type: "text", x: 60, y: 540, w: 700, h: 60, text: "Maple Pecan Latte", fontFamily: "display", fontSize: 40, fontWeight: 700, color: p11.deep, align: "left", lineHeight: 1.1 },
    { type: "shape", shape: "rect", x: 790, y: 540, w: 230, h: 56, fill: p11.deep, radius: 28, opacity: 1 },
    { type: "text", x: 790, y: 558, w: 230, h: 24, text: "$5.50", fontFamily: "display", fontSize: 20, fontWeight: 700, color: "#ffffff", align: "center", lineHeight: 1 },
    { type: "text", x: 60, y: 618, w: 800, h: 60, text: "House espresso, steamed oat milk, maple syrup, toasted pecan — back for fall.", fontFamily: "body", fontSize: 16, fontWeight: 400, color: p11.mid, align: "left", lineHeight: 1.5 },
    { type: "shape", shape: "rect", x: 60, y: 820, w: 960, h: 84, fill: p11.tint2, radius: 14, opacity: 1, stroke: p11.mid, strokeWidth: 1.5 },
    { type: "text", x: 60, y: 850, w: 960, h: 30, text: "Today only — stop by before we sell out", fontFamily: "display", fontSize: 18, fontWeight: 600, color: p11.deep, align: "center", lineHeight: 1.2 },
    ...bizFooter(p11.deep),
  ]),
};

// ---------- Fitness Class Schedule (Flyer, 1080x1350) ----------
const p12 = { deep: "#14161a", neon: "#c6ff3d", tint: "#22262c" };
const fitnessSchedule: TemplatePreset = {
  id: "fitness-schedule",
  name: "Fitness Class Schedule",
  category: "Flyer",
  keywords: ["fitness", "gym", "class schedule", "workout", "yoga", "studio", "week"],
  doc: finalize(1080, 1350, p12.deep, [
    { type: "icon", x: 60, y: 70, w: 34, h: 34, icon: "bolt", color: p12.neon },
    { type: "text", x: 110, y: 76, w: 500, h: 34, text: "[Studio Name]", fontFamily: "display", fontSize: 20, fontWeight: 700, color: "#ffffff", align: "left", lineHeight: 1.2 },
    { type: "text", x: 60, y: 150, w: 960, h: 90, text: "This Week's Classes", fontFamily: "display", fontSize: 48, fontWeight: 700, color: "#ffffff", align: "left", lineHeight: 1.1 },
    { type: "shape", shape: "line", x: 60, y: 260, w: 90, h: 4, fill: p12.neon, radius: 0, opacity: 1 },
    { type: "shape", shape: "rect", x: 60, y: 310, w: 960, h: 90, fill: p12.tint, radius: 12, opacity: 1 },
    { type: "text", x: 90, y: 336, w: 140, h: 30, text: "MON", fontFamily: "display", fontSize: 15, fontWeight: 700, color: p12.neon, align: "left", lineHeight: 1 },
    { type: "text", x: 230, y: 336, w: 500, h: 30, text: "6:00 AM — Sunrise Yoga", fontFamily: "body", fontSize: 17, fontWeight: 600, color: "#ffffff", align: "left", lineHeight: 1 },
    { type: "shape", shape: "rect", x: 60, y: 412, w: 960, h: 90, fill: p12.tint, radius: 12, opacity: 1 },
    { type: "text", x: 90, y: 438, w: 140, h: 30, text: "WED", fontFamily: "display", fontSize: 15, fontWeight: 700, color: p12.neon, align: "left", lineHeight: 1 },
    { type: "text", x: 230, y: 438, w: 500, h: 30, text: "5:30 PM — HIIT Circuit", fontFamily: "body", fontSize: 17, fontWeight: 600, color: "#ffffff", align: "left", lineHeight: 1 },
    { type: "shape", shape: "rect", x: 60, y: 514, w: 960, h: 90, fill: p12.tint, radius: 12, opacity: 1 },
    { type: "text", x: 90, y: 540, w: 140, h: 30, text: "FRI", fontFamily: "display", fontSize: 15, fontWeight: 700, color: p12.neon, align: "left", lineHeight: 1 },
    { type: "text", x: 230, y: 540, w: 500, h: 30, text: "6:00 PM — Strength & Core", fontFamily: "body", fontSize: 17, fontWeight: 600, color: "#ffffff", align: "left", lineHeight: 1 },
    { type: "shape", shape: "rect", x: 60, y: 616, w: 960, h: 90, fill: p12.tint, radius: 12, opacity: 1 },
    { type: "text", x: 90, y: 642, w: 140, h: 30, text: "SAT", fontFamily: "display", fontSize: 15, fontWeight: 700, color: p12.neon, align: "left", lineHeight: 1 },
    { type: "text", x: 230, y: 642, w: 500, h: 30, text: "9:00 AM — Open Gym", fontFamily: "body", fontSize: 17, fontWeight: 600, color: "#ffffff", align: "left", lineHeight: 1 },
    { type: "shape", shape: "rect", x: 60, y: 1150, w: 960, h: 100, fill: p12.neon, radius: 14, opacity: 1 },
    { type: "text", x: 60, y: 1180, w: 960, h: 40, text: "First class free — just show up", fontFamily: "display", fontSize: 20, fontWeight: 700, color: p12.deep, align: "center", lineHeight: 1.2 },
    { type: "text", x: 60, y: 1300, w: 960, h: 24, text: "[studioname.com]  ·  @[Instagram handle]", fontFamily: "body", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", align: "center", lineHeight: 1.2 },
  ]),
};

// ---------- Salon Service Menu (Social Post, 1080x1080) ----------
const p13 = { deep: "#7a2e3a", gold: "#c79a4b", blush: "#f7e6e6", ink: "#6b4a4e" };
const salonServiceMenu: TemplatePreset = {
  id: "salon-service-menu",
  name: "Salon Service Menu",
  category: "Social Post",
  keywords: ["salon", "beauty", "hair", "nails", "spa", "service menu", "price list"],
  doc: finalize(1080, 1080, p13.blush, [
    ...bizHeader(p13.deep, "sparkle", "Service Menu"),
    { type: "text", x: 0, y: 140, w: 1080, h: 60, text: "This Season's Services", fontFamily: "display", fontSize: 30, fontWeight: 700, color: p13.deep, align: "center", lineHeight: 1.1 },
    { type: "shape", shape: "rect", x: 90, y: 240, w: 900, h: 620, fill: "#ffffff", radius: 18, opacity: 1 },
    { type: "text", x: 130, y: 280, w: 600, h: 28, text: "Signature Cut & Style", fontFamily: "display", fontSize: 18, fontWeight: 600, color: p13.deep, align: "left", lineHeight: 1 },
    { type: "text", x: 850, y: 280, w: 100, h: 28, text: "$65", fontFamily: "display", fontSize: 18, fontWeight: 700, color: p13.gold, align: "right", lineHeight: 1 },
    { type: "shape", shape: "line", x: 130, y: 324, w: 820, h: 1.5, fill: p13.blush, radius: 0, opacity: 1 },
    { type: "text", x: 130, y: 350, w: 600, h: 28, text: "Balayage", fontFamily: "display", fontSize: 18, fontWeight: 600, color: p13.deep, align: "left", lineHeight: 1 },
    { type: "text", x: 850, y: 350, w: 100, h: 28, text: "$180", fontFamily: "display", fontSize: 18, fontWeight: 700, color: p13.gold, align: "right", lineHeight: 1 },
    { type: "shape", shape: "line", x: 130, y: 394, w: 820, h: 1.5, fill: p13.blush, radius: 0, opacity: 1 },
    { type: "text", x: 130, y: 420, w: 600, h: 28, text: "Gel Manicure", fontFamily: "display", fontSize: 18, fontWeight: 600, color: p13.deep, align: "left", lineHeight: 1 },
    { type: "text", x: 850, y: 420, w: 100, h: 28, text: "$40", fontFamily: "display", fontSize: 18, fontWeight: 700, color: p13.gold, align: "right", lineHeight: 1 },
    { type: "shape", shape: "line", x: 130, y: 464, w: 820, h: 1.5, fill: p13.blush, radius: 0, opacity: 1 },
    { type: "text", x: 130, y: 490, w: 600, h: 28, text: "Deep Conditioning Treatment", fontFamily: "display", fontSize: 18, fontWeight: 600, color: p13.deep, align: "left", lineHeight: 1 },
    { type: "text", x: 850, y: 490, w: 100, h: 28, text: "$35", fontFamily: "display", fontSize: 18, fontWeight: 700, color: p13.gold, align: "right", lineHeight: 1 },
    { type: "shape", shape: "line", x: 130, y: 534, w: 820, h: 1.5, fill: p13.blush, radius: 0, opacity: 1 },
    { type: "text", x: 130, y: 560, w: 600, h: 28, text: "Facial + Brow Shape", fontFamily: "display", fontSize: 18, fontWeight: 600, color: p13.deep, align: "left", lineHeight: 1 },
    { type: "text", x: 850, y: 560, w: 100, h: 28, text: "$70", fontFamily: "display", fontSize: 18, fontWeight: 700, color: p13.gold, align: "right", lineHeight: 1 },
    { type: "text", x: 130, y: 780, w: 820, h: 50, text: "Book your appointment — link in bio", fontFamily: "body", fontSize: 15, fontWeight: 500, color: p13.ink, align: "center", lineHeight: 1.4 },
    ...bizFooter(p13.deep),
  ]),
};

// ---------- Restaurant Featured Dish (Social Post, 1080x1080) ----------
const p14 = { deep: "#5a1a1a", mid: "#8a3b2a", cream: "#f6ecd9" };
const restaurantFeaturedDish: TemplatePreset = {
  id: "restaurant-featured-dish",
  name: "Restaurant Featured Dish",
  category: "Social Post",
  keywords: ["restaurant", "dish", "menu", "special", "food", "chef", "dinner"],
  doc: finalize(1080, 1080, p14.deep, [
    { type: "text", x: 0, y: 100, w: 1080, h: 30, text: "CHEF'S FEATURE", fontFamily: "body", fontSize: 14, fontWeight: 700, color: p14.cream, align: "center", lineHeight: 1.2 },
    { type: "shape", shape: "rect", x: 90, y: 160, w: 900, h: 500, fill: p14.mid, radius: 18, opacity: 1 },
    { type: "text", x: 0, y: 700, w: 1080, h: 70, text: "Braised Short Rib", fontFamily: "display", fontSize: 46, fontWeight: 700, color: "#ffffff", align: "center", lineHeight: 1.1 },
    { type: "text", x: 140, y: 780, w: 800, h: 60, text: "Slow-braised 8 hours, root vegetable purée, red wine jus.", fontFamily: "body", fontSize: 16, fontWeight: 400, color: "rgba(255,255,255,0.75)", align: "center", lineHeight: 1.5 },
    { type: "shape", shape: "rect", x: 440, y: 860, w: 200, h: 56, fill: p14.cream, radius: 28, opacity: 1 },
    { type: "text", x: 440, y: 878, w: 200, h: 24, text: "$32", fontFamily: "display", fontSize: 20, fontWeight: 700, color: p14.deep, align: "center", lineHeight: 1 },
    ...bizFooter(p14.deep),
  ]),
};

// ---------- Non-profit Donation Drive (Flyer, 1080x1350) ----------
const p15 = { teal: "#0d5c5c", orange: "#e8752c", cream: "#eef7f5" };
const donationDrive: TemplatePreset = {
  id: "donation-drive",
  name: "Non-profit Donation Drive",
  category: "Flyer",
  keywords: ["nonprofit", "donation", "fundraiser", "charity", "drive", "goal", "give"],
  doc: finalize(1080, 1350, "#ffffff", [
    ...bizHeader(p15.teal, "leaf", "Fundraiser"),
    { type: "text", x: 60, y: 150, w: 960, h: 130, text: "Help us reach our goal", fontFamily: "display", fontSize: 46, fontWeight: 700, color: p15.teal, align: "left", lineHeight: 1.15 },
    { type: "text", x: 60, y: 300, w: 900, h: 60, text: "Every dollar goes straight to families in our community this winter.", fontFamily: "body", fontSize: 17, fontWeight: 400, color: "#5c6b63", align: "left", lineHeight: 1.5 },
    { type: "shape", shape: "rect", x: 60, y: 400, w: 960, h: 26, fill: p15.cream, radius: 13, opacity: 1 },
    { type: "shape", shape: "rect", x: 60, y: 400, w: 650, h: 26, fill: p15.orange, radius: 13, opacity: 1 },
    { type: "text", x: 60, y: 440, w: 500, h: 26, text: "$13,000 raised", fontFamily: "display", fontSize: 18, fontWeight: 700, color: p15.teal, align: "left", lineHeight: 1 },
    { type: "text", x: 560, y: 440, w: 460, h: 26, text: "of $20,000 goal", fontFamily: "body", fontSize: 15, fontWeight: 500, color: "#5c6b63", align: "right", lineHeight: 1.2 },
    { type: "shape", shape: "rect", x: 60, y: 540, w: 960, h: 560, fill: p15.cream, radius: 16, opacity: 1 },
    { type: "shape", shape: "rect", x: 0, y: 1180, w: 1080, h: 100, fill: p15.orange, radius: 0, opacity: 1 },
    { type: "text", x: 0, y: 1210, w: 1080, h: 40, text: "Give today at [website.org/give]", fontFamily: "display", fontSize: 20, fontWeight: 600, color: "#ffffff", align: "center", lineHeight: 1.2 },
    ...bizFooter(p15.teal),
  ]),
};

// ---------- Tutoring Session Booking (Social Post, 1080x1080) ----------
const p16 = { indigo: "#2b2467", yellow: "#f4c95d", tint: "#ece9fb" };
const tutoringBooking: TemplatePreset = {
  id: "tutoring-booking",
  name: "Tutoring Session Booking",
  category: "Social Post",
  keywords: ["tutoring", "coaching", "lesson", "session", "education", "book", "learning"],
  doc: finalize(1080, 1080, "#ffffff", [
    ...bizHeader(p16.indigo, "star", "Book a Session"),
    { type: "text", x: 60, y: 150, w: 960, h: 140, text: "Struggling with algebra? Let's fix that.", fontFamily: "display", fontSize: 40, fontWeight: 700, color: p16.indigo, align: "left", lineHeight: 1.2 },
    { type: "text", x: 60, y: 300, w: 800, h: 50, text: "One-on-one sessions, tailored to how your kid actually learns.", fontFamily: "body", fontSize: 16, fontWeight: 400, color: "#5c5a72", align: "left", lineHeight: 1.5 },
    { type: "shape", shape: "rect", x: 60, y: 400, w: 460, h: 220, fill: p16.tint, radius: 14, opacity: 1 },
    { type: "text", x: 90, y: 430, w: 400, h: 30, text: "Free intro call", fontFamily: "display", fontSize: 19, fontWeight: 700, color: p16.indigo, align: "left", lineHeight: 1 },
    { type: "text", x: 90, y: 470, w: 400, h: 80, text: "15 minutes, no pressure — we'll figure out where to start.", fontFamily: "body", fontSize: 14, fontWeight: 400, color: "#5c5a72", align: "left", lineHeight: 1.5 },
    { type: "shape", shape: "rect", x: 560, y: 400, w: 460, h: 220, fill: p16.indigo, radius: 14, opacity: 1 },
    { type: "text", x: 590, y: 430, w: 400, h: 30, text: "Weekly sessions", fontFamily: "display", fontSize: 19, fontWeight: 700, color: "#ffffff", align: "left", lineHeight: 1 },
    { type: "text", x: 590, y: 470, w: 400, h: 80, text: "45 minutes, same time each week, progress reports included.", fontFamily: "body", fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.8)", align: "left", lineHeight: 1.5 },
    { type: "shape", shape: "rect", x: 60, y: 820, w: 960, h: 84, fill: p16.yellow, radius: 14, opacity: 1 },
    { type: "text", x: 60, y: 850, w: 960, h: 30, text: "Book your free intro call today", fontFamily: "display", fontSize: 18, fontWeight: 700, color: p16.indigo, align: "center", lineHeight: 1.2 },
    ...bizFooter(p16.indigo),
  ]),
};

// ---------- Cleaning Service Booking (Social Post, 1080x1080) ----------
const p17 = { deep: "#1a6fa8", tint: "#e8f4fc", ink: "#3d5a6e" };
const cleaningServiceBooking: TemplatePreset = {
  id: "cleaning-service-booking",
  name: "Cleaning Service Booking",
  category: "Social Post",
  keywords: ["cleaning", "housekeeping", "maid service", "booking", "home services"],
  doc: finalize(1080, 1080, "#ffffff", [
    ...bizHeader(p17.deep, "drop", "Book Now"),
    { type: "text", x: 60, y: 150, w: 960, h: 100, text: "A spotless home, zero effort", fontFamily: "display", fontSize: 42, fontWeight: 700, color: p17.deep, align: "left", lineHeight: 1.15 },
    { type: "text", x: 60, y: 260, w: 800, h: 40, text: "Fully insured, background-checked, and booked in under a minute.", fontFamily: "body", fontSize: 16, fontWeight: 400, color: p17.ink, align: "left", lineHeight: 1.4 },
    { type: "shape", shape: "rect", x: 60, y: 340, w: 960, h: 400, fill: p17.tint, radius: 16, opacity: 1 },
    { type: "icon", x: 100, y: 375, w: 26, h: 26, icon: "check", color: p17.deep },
    { type: "text", x: 145, y: 378, w: 800, h: 26, text: "Kitchen & bathrooms deep-cleaned", fontFamily: "body", fontSize: 16, fontWeight: 500, color: p17.deep, align: "left", lineHeight: 1 },
    { type: "icon", x: 100, y: 435, w: 26, h: 26, icon: "check", color: p17.deep },
    { type: "text", x: 145, y: 438, w: 800, h: 26, text: "Dusting, vacuuming, mopping — every room", fontFamily: "body", fontSize: 16, fontWeight: 500, color: p17.deep, align: "left", lineHeight: 1 },
    { type: "icon", x: 100, y: 495, w: 26, h: 26, icon: "check", color: p17.deep },
    { type: "text", x: 145, y: 498, w: 800, h: 26, text: "Eco-friendly products, pet-safe", fontFamily: "body", fontSize: 16, fontWeight: 500, color: p17.deep, align: "left", lineHeight: 1 },
    { type: "icon", x: 100, y: 555, w: 26, h: 26, icon: "check", color: p17.deep },
    { type: "text", x: 145, y: 558, w: 800, h: 26, text: "Same cleaner every visit, if you'd like", fontFamily: "body", fontSize: 16, fontWeight: 500, color: p17.deep, align: "left", lineHeight: 1 },
    { type: "shape", shape: "rect", x: 60, y: 820, w: 960, h: 84, fill: p17.deep, radius: 14, opacity: 1 },
    { type: "text", x: 60, y: 850, w: 960, h: 30, text: "First clean 20% off — book this week", fontFamily: "display", fontSize: 18, fontWeight: 700, color: "#ffffff", align: "center", lineHeight: 1.2 },
    ...bizFooter(p17.deep),
  ]),
};

// ---------- E-commerce Flash Sale (Social Post, 1080x1080) ----------
const p18 = { black: "#0d0d0d", gold: "#d4af37" };
const ecommerceFlashSale: TemplatePreset = {
  id: "ecommerce-flash-sale",
  name: "E-commerce Flash Sale",
  category: "Social Post",
  keywords: ["sale", "flash sale", "discount", "ecommerce", "shop", "percent off", "black friday"],
  doc: finalize(1080, 1080, p18.black, [
    { type: "shape", shape: "line", x: 90, y: 90, w: 900, h: 1.5, fill: "rgba(255,255,255,0.2)", radius: 0, opacity: 1 },
    { type: "text", x: 0, y: 120, w: 1080, h: 30, text: "48 HOURS ONLY", fontFamily: "body", fontSize: 15, fontWeight: 700, color: p18.gold, align: "center", lineHeight: 1.2 },
    { type: "text", x: 0, y: 220, w: 1080, h: 300, text: "40% OFF", fontFamily: "display", fontSize: 130, fontWeight: 700, color: "#ffffff", align: "center", lineHeight: 1 },
    { type: "text", x: 140, y: 530, w: 800, h: 40, text: "Everything in the store, no exclusions", fontFamily: "body", fontSize: 20, fontWeight: 400, color: "rgba(255,255,255,0.75)", align: "center", lineHeight: 1.3 },
    { type: "shape", shape: "rect", x: 390, y: 610, w: 300, h: 66, fill: p18.gold, radius: 33, opacity: 1 },
    { type: "text", x: 390, y: 632, w: 300, h: 24, text: "CODE: FLASH40", fontFamily: "display", fontSize: 15, fontWeight: 700, color: p18.black, align: "center", lineHeight: 1 },
    { type: "shape", shape: "line", x: 90, y: 990, w: 900, h: 1.5, fill: "rgba(255,255,255,0.2)", radius: 0, opacity: 1 },
    { type: "text", x: 0, y: 1015, w: 1080, h: 30, text: "[shopname.com] · @[Instagram handle]", fontFamily: "body", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.65)", align: "center", lineHeight: 1.2 },
  ]),
};

// ---------- Law Firm Consultation (Social Post, 1080x1080) ----------
const p19 = { navy: "#12233f", gold: "#b8863c", tint: "#eef1f6" };
const lawFirmConsultation: TemplatePreset = {
  id: "law-firm-consultation",
  name: "Law Firm Consultation",
  category: "Social Post",
  keywords: ["law firm", "lawyer", "attorney", "legal", "consultation", "professional"],
  doc: finalize(1080, 1080, "#ffffff", [
    ...bizHeader(p19.navy, "shield", "Free Consultation"),
    { type: "icon", x: 490, y: 160, w: 100, h: 100, icon: "shield", color: "#ffffff", background: p19.navy },
    { type: "text", x: 0, y: 300, w: 1080, h: 70, text: "When it matters, get real advice", fontFamily: "display", fontSize: 36, fontWeight: 700, color: p19.navy, align: "center", lineHeight: 1.2 },
    { type: "text", x: 190, y: 390, w: 700, h: 60, text: "Family, estate, and business law — a straightforward first conversation, no obligation.", fontFamily: "body", fontSize: 15.5, fontWeight: 400, color: "#5c6270", align: "center", lineHeight: 1.5 },
    { type: "shape", shape: "line", x: 490, y: 490, w: 100, h: 2, fill: p19.gold, radius: 0, opacity: 1 },
    { type: "shape", shape: "rect", x: 190, y: 550, w: 700, h: 260, fill: p19.tint, radius: 16, opacity: 1 },
    { type: "text", x: 230, y: 590, w: 620, h: 26, text: "[Attorney Name], Esq.", fontFamily: "display", fontSize: 19, fontWeight: 700, color: p19.navy, align: "left", lineHeight: 1 },
    { type: "text", x: 230, y: 626, w: 620, h: 24, text: "15+ years of practice · [Bar Number]", fontFamily: "body", fontSize: 13.5, fontWeight: 500, color: p19.gold, align: "left", lineHeight: 1 },
    { type: "text", x: 230, y: 670, w: 620, h: 90, text: "Call or email to schedule your free 20-minute consultation — evenings available.", fontFamily: "body", fontSize: 14.5, fontWeight: 400, color: "#5c6270", align: "left", lineHeight: 1.5 },
    ...bizFooter(p19.navy),
  ]),
};

// ---------- Podcast Episode Announcement (Social Post, 1080x1080) ----------
const p20 = { deep: "#241a35", pink: "#d94f9c", tint: "rgba(217,79,156,0.16)" };
const podcastEpisode: TemplatePreset = {
  id: "podcast-episode",
  name: "Podcast Episode Announcement",
  category: "Social Post",
  keywords: ["podcast", "episode", "new episode", "listen", "audio", "show"],
  doc: finalize(1080, 1080, p20.deep, [
    { type: "shape", shape: "ellipse", x: -180, y: -180, w: 520, h: 520, fill: p20.pink, radius: 0, opacity: 0.16 },
    { type: "shape", shape: "rect", x: 90, y: 110, w: 220, h: 48, fill: p20.tint, radius: 24, opacity: 1, stroke: p20.pink, strokeWidth: 1 },
    { type: "text", x: 90, y: 124, w: 220, h: 22, text: "NEW EPISODE", fontFamily: "body", fontSize: 12, fontWeight: 700, color: p20.pink, align: "center", lineHeight: 1 },
    { type: "text", x: 90, y: 190, w: 900, h: 40, text: "EPISODE 42", fontFamily: "body", fontSize: 18, fontWeight: 600, color: "rgba(255,255,255,0.6)", align: "left", lineHeight: 1 },
    { type: "text", x: 90, y: 240, w: 900, h: 220, text: "Why most freelancers underprice themselves", fontFamily: "display", fontSize: 52, fontWeight: 700, color: "#ffffff", align: "left", lineHeight: 1.15 },
    { type: "text", x: 90, y: 480, w: 780, h: 60, text: "A conversation on pricing, confidence, and knowing your worth.", fontFamily: "body", fontSize: 18, fontWeight: 400, color: "rgba(255,255,255,0.7)", align: "left", lineHeight: 1.5 },
    { type: "shape", shape: "rect", x: 90, y: 590, w: 900, h: 320, fill: "rgba(255,255,255,0.06)", radius: 18, opacity: 1, stroke: "rgba(255,255,255,0.14)", strokeWidth: 1 },
    { type: "icon", x: 500, y: 700, w: 80, h: 80, icon: "sparkle", color: p20.pink },
    { type: "text", x: 90, y: 960, w: 900, h: 30, text: "Listen now — link in bio", fontFamily: "display", fontSize: 17, fontWeight: 600, color: p20.pink, align: "left", lineHeight: 1.2 },
  ]),
};

// ---------- Webinar Registration (Flyer, 1080x1350) ----------
const p21 = { blue: "#123a63", mid: "#3f6d99", tint: "#e7f0fb" };
const webinarRegistration: TemplatePreset = {
  id: "webinar-registration",
  name: "Webinar Registration",
  category: "Flyer",
  keywords: ["webinar", "event", "registration", "register", "online event", "workshop", "sign up"],
  doc: finalize(1080, 1350, "#ffffff", [
    ...bizHeader(p21.blue, "calendar", "Free Webinar"),
    { type: "text", x: 60, y: 150, w: 960, h: 150, text: "5 Systems Every Small Business Needs", fontFamily: "display", fontSize: 42, fontWeight: 700, color: p21.blue, align: "left", lineHeight: 1.2 },
    { type: "text", x: 60, y: 320, w: 900, h: 50, text: "A free, live 45-minute session — bring your questions.", fontFamily: "body", fontSize: 17, fontWeight: 400, color: "#5c6b7a", align: "left", lineHeight: 1.4 },
    { type: "shape", shape: "rect", x: 60, y: 400, w: 473, h: 86, fill: p21.blue, radius: 14, opacity: 1 },
    { type: "icon", x: 80, y: 420, w: 32, h: 32, icon: "calendar", color: "#ffffff" },
    { type: "text", x: 126, y: 418, w: 300, h: 16, text: "DATE", fontFamily: "body", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.8)", align: "left", lineHeight: 1 },
    { type: "text", x: 126, y: 440, w: 380, h: 22, text: "Thursday, Sept 18", fontFamily: "display", fontSize: 16.5, fontWeight: 600, color: "#ffffff", align: "left", lineHeight: 1 },
    { type: "shape", shape: "rect", x: 547, y: 400, w: 473, h: 86, fill: p21.blue, radius: 14, opacity: 1 },
    { type: "icon", x: 567, y: 420, w: 32, h: 32, icon: "clock", color: "#ffffff" },
    { type: "text", x: 613, y: 418, w: 300, h: 16, text: "TIME", fontFamily: "body", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.8)", align: "left", lineHeight: 1 },
    { type: "text", x: 613, y: 440, w: 380, h: 22, text: "12:00 – 12:45 PM", fontFamily: "display", fontSize: 16.5, fontWeight: 600, color: "#ffffff", align: "left", lineHeight: 1 },
    { type: "shape", shape: "rect", x: 60, y: 520, w: 960, h: 500, fill: p21.tint, radius: 16, opacity: 1 },
    { type: "shape", shape: "rect", x: 60, y: 1150, w: 960, h: 100, fill: p21.mid, radius: 0, opacity: 1 },
    { type: "text", x: 60, y: 1180, w: 960, h: 40, text: "Register free at [website.com/webinar]", fontFamily: "display", fontSize: 20, fontWeight: 600, color: "#ffffff", align: "center", lineHeight: 1.2 },
    ...bizFooter(p21.blue),
  ]),
};

// ---------- Birthday / Celebration Sale (Social Post, 1080x1080) ----------
const p22 = { plum: "#6b2749", pink: "#fbe4ec", gold: "#d9a441" };
const celebrationSale: TemplatePreset = {
  id: "celebration-sale",
  name: "Birthday Celebration Sale",
  category: "Social Post",
  keywords: ["birthday", "anniversary", "celebration", "sale", "party", "milestone", "years"],
  doc: finalize(1080, 1080, p22.pink, [
    { type: "shape", shape: "ellipse", x: -160, y: -160, w: 420, h: 420, fill: p22.gold, radius: 0, opacity: 0.18 },
    { type: "shape", shape: "ellipse", x: 820, y: 780, w: 420, h: 420, fill: p22.plum, radius: 0, opacity: 0.12 },
    { type: "text", x: 0, y: 140, w: 1080, h: 30, text: "WE'RE CELEBRATING", fontFamily: "body", fontSize: 15, fontWeight: 700, color: p22.plum, align: "center", lineHeight: 1.2 },
    { type: "text", x: 90, y: 190, w: 900, h: 180, text: "5 Years!", fontFamily: "display", fontSize: 90, fontWeight: 700, color: p22.plum, align: "center", lineHeight: 1 },
    { type: "text", x: 140, y: 400, w: 800, h: 60, text: "Thank you for five wonderful years — let's celebrate together.", fontFamily: "body", fontSize: 18, fontWeight: 400, color: "#7a5a68", align: "center", lineHeight: 1.5 },
    { type: "shape", shape: "rect", x: 240, y: 520, w: 600, h: 220, fill: "#ffffff", radius: 20, opacity: 1 },
    { type: "text", x: 240, y: 560, w: 600, h: 50, text: "25% OFF", fontFamily: "display", fontSize: 40, fontWeight: 700, color: p22.plum, align: "center", lineHeight: 1 },
    { type: "text", x: 240, y: 630, w: 600, h: 60, text: "everything, this weekend only", fontFamily: "body", fontSize: 16, fontWeight: 500, color: "#7a5a68", align: "center", lineHeight: 1.3 },
    { type: "shape", shape: "rect", x: 390, y: 800, w: 300, h: 60, fill: p22.plum, radius: 30, opacity: 1 },
    { type: "text", x: 390, y: 820, w: 300, h: 24, text: "CODE: FIVEYEARS", fontFamily: "display", fontSize: 14, fontWeight: 700, color: "#ffffff", align: "center", lineHeight: 1 },
    { type: "text", x: 0, y: 990, w: 1080, h: 30, text: "[Business Name] · @[Instagram handle]", fontFamily: "body", fontSize: 13, fontWeight: 600, color: "#8a6b76", align: "center", lineHeight: 1.2 },
  ]),
};

// ============================================================
// Batch 2 — rounding out the thin categories (Logo, Business Card,
// Presentation only had 2 each) and a handful more Social Post/Flyer
// verticals that weren't covered yet.
// ============================================================

// ---------- Emblem Logo (Logo, 1080x1080) ----------
const p23 = { deep: "#26332b", gold: "#c79a4b" };
const emblemLogo: TemplatePreset = {
  id: "emblem-logo",
  name: "Emblem Logo",
  category: "Logo",
  keywords: ["logo", "emblem", "crest", "badge", "outdoors", "brewery", "classic"],
  doc: finalize(1080, 1080, "#ffffff", [
    { type: "shape", shape: "ellipse", x: 240, y: 240, w: 600, h: 600, fill: "#ffffff", radius: 0, opacity: 1, stroke: p23.deep, strokeWidth: 5 },
    { type: "shape", shape: "ellipse", x: 275, y: 275, w: 530, h: 530, fill: "#ffffff", radius: 0, opacity: 1, stroke: p23.gold, strokeWidth: 2 },
    { type: "icon", x: 470, y: 400, w: 140, h: 140, icon: "leaf", color: p23.deep },
    { type: "text", x: 290, y: 570, w: 500, h: 60, text: "TIMBER & CO.", fontFamily: "display", fontSize: 34, fontWeight: 700, color: p23.deep, align: "center", lineHeight: 1 },
    { type: "shape", shape: "line", x: 440, y: 645, w: 200, h: 1.5, fill: p23.gold, radius: 0, opacity: 1 },
    { type: "text", x: 290, y: 660, w: 500, h: 24, text: "ESTABLISHED 2016", fontFamily: "body", fontSize: 12, fontWeight: 600, color: p23.gold, align: "center", lineHeight: 1 },
  ]),
};

// ---------- Geometric Mark (Logo, 1080x1080) ----------
const p24 = { deep: "#1a1a2e", accent1: "#e94560", accent2: "#0f9b8e" };
const geometricMark: TemplatePreset = {
  id: "geometric-mark",
  name: "Geometric Mark",
  category: "Logo",
  keywords: ["logo", "geometric", "abstract", "tech", "startup", "modern", "shapes"],
  doc: finalize(1080, 1080, "#ffffff", [
    { type: "shape", shape: "rect", x: 380, y: 300, w: 180, h: 180, fill: p24.deep, radius: 24, opacity: 1, rotation: 12 },
    { type: "shape", shape: "ellipse", x: 520, y: 300, w: 180, h: 180, fill: p24.accent1, radius: 0, opacity: 0.9 },
    { type: "shape", shape: "rect", x: 450, y: 420, w: 180, h: 180, fill: p24.accent2, radius: 24, opacity: 0.9 },
    { type: "text", x: 190, y: 660, w: 700, h: 60, text: "Nimbus", fontFamily: "display", fontSize: 46, fontWeight: 700, color: p24.deep, align: "center", lineHeight: 1 },
    { type: "text", x: 190, y: 726, w: 700, h: 26, text: "PRODUCT STUDIO", fontFamily: "body", fontSize: 13, fontWeight: 600, color: "#6b6b80", align: "center", lineHeight: 1 },
  ]),
};

// ---------- Script Wordmark (Logo, 1080x1080) ----------
const p25 = { ink: "#2b2420", rose: "#b5707a" };
const scriptWordmark: TemplatePreset = {
  id: "script-wordmark",
  name: "Script Wordmark",
  category: "Logo",
  keywords: ["logo", "wordmark", "script", "boutique", "elegant", "florist", "bridal"],
  doc: finalize(1080, 1080, "#fdfaf7", [
    { type: "text", x: 90, y: 420, w: 900, h: 140, text: "Willow & Sage", fontFamily: "serif", fontSize: 66, fontWeight: 600, color: p25.ink, align: "center", lineHeight: 1 },
    { type: "shape", shape: "line", x: 440, y: 570, w: 60, h: 1.5, fill: p25.rose, radius: 0, opacity: 1 },
    { type: "icon", x: 520, y: 545, w: 40, h: 40, icon: "leaf", color: p25.rose },
    { type: "shape", shape: "line", x: 580, y: 570, w: 60, h: 1.5, fill: p25.rose, radius: 0, opacity: 1 },
    { type: "text", x: 90, y: 610, w: 900, h: 26, text: "FLORAL DESIGN STUDIO", fontFamily: "body", fontSize: 13, fontWeight: 600, color: p25.rose, align: "center", lineHeight: 1 },
  ]),
};

// ---------- Stacked Icon Logo (Logo, 1080x1080) ----------
const p26 = { deep: "#12324d", tint: "#e7f0f7" };
const stackedIconLogo: TemplatePreset = {
  id: "stacked-icon-logo",
  name: "Stacked Icon Logo",
  category: "Logo",
  keywords: ["logo", "minimal", "icon", "stacked", "simple", "clean", "consulting"],
  doc: finalize(1080, 1080, "#ffffff", [
    { type: "shape", shape: "rect", x: 460, y: 320, w: 160, h: 160, fill: p26.tint, radius: 32, opacity: 1 },
    { type: "icon", x: 500, y: 360, w: 80, h: 80, icon: "bolt", color: p26.deep },
    { type: "text", x: 190, y: 540, w: 700, h: 50, text: "Vertex Consulting", fontFamily: "display", fontSize: 34, fontWeight: 700, color: p26.deep, align: "center", lineHeight: 1 },
    { type: "text", x: 190, y: 598, w: 700, h: 24, text: "STRATEGY · GROWTH · OPERATIONS", fontFamily: "body", fontSize: 12.5, fontWeight: 600, color: "#5c7180", align: "center", lineHeight: 1 },
  ]),
};

// ---------- Bold Color Block Card (Business Card, 1050x600) ----------
const p27 = { orange: "#e2601a", ink: "#20140c", cream: "#fdf3e7" };
const boldColorBlockCard: TemplatePreset = {
  id: "bold-color-block-card",
  name: "Bold Color Block Card",
  category: "Business Card",
  keywords: ["business card", "bold", "colorful", "creative", "agency"],
  doc: finalize(1050, 600, p27.cream, [
    { type: "shape", shape: "rect", x: 0, y: 0, w: 1050, h: 210, fill: p27.orange, radius: 0, opacity: 1 },
    { type: "text", x: 40, y: 240, w: 600, h: 50, text: "Maya Osei", fontFamily: "display", fontSize: 30, fontWeight: 700, color: p27.ink, align: "left", lineHeight: 1 },
    { type: "text", x: 40, y: 296, w: 600, h: 30, text: "Brand Strategist", fontFamily: "body", fontSize: 15, fontWeight: 600, color: p27.orange, align: "left", lineHeight: 1 },
    { type: "icon", x: 40, y: 380, w: 22, h: 22, icon: "mail", color: p27.ink },
    { type: "text", x: 75, y: 380, w: 400, h: 24, text: "maya@studioform.co", fontFamily: "body", fontSize: 14, fontWeight: 400, color: p27.ink, align: "left", lineHeight: 1.2 },
    { type: "icon", x: 40, y: 416, w: 22, h: 22, icon: "globe", color: p27.ink },
    { type: "text", x: 75, y: 416, w: 400, h: 24, text: "studioform.co", fontFamily: "body", fontSize: 14, fontWeight: 400, color: p27.ink, align: "left", lineHeight: 1.2 },
    { type: "shape", shape: "ellipse", x: 880, y: 60, w: 100, h: 100, fill: p27.ink, radius: 0, opacity: 1 },
  ]),
};

// ---------- Luxury Gold Card (Business Card, 1050x600) ----------
const p28 = { black: "#0d0d0d", gold: "#c9a34f" };
const luxuryGoldCard: TemplatePreset = {
  id: "luxury-gold-card",
  name: "Luxury Gold Card",
  category: "Business Card",
  keywords: ["business card", "luxury", "gold", "black", "elegant", "premium"],
  doc: finalize(1050, 600, p28.black, [
    { type: "shape", shape: "rect", x: 40, y: 40, w: 970, h: 520, fill: p28.black, radius: 0, opacity: 1, stroke: p28.gold, strokeWidth: 1.5 },
    { type: "text", x: 0, y: 200, w: 1050, h: 50, text: "AURELIA", fontFamily: "display", fontSize: 34, fontWeight: 700, color: p28.gold, align: "center", lineHeight: 1 },
    { type: "text", x: 0, y: 258, w: 1050, h: 24, text: "INTERIORS", fontFamily: "body", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", align: "center", lineHeight: 1 },
    { type: "shape", shape: "line", x: 475, y: 330, w: 100, h: 1, fill: p28.gold, radius: 0, opacity: 1 },
    { type: "text", x: 0, y: 400, w: 1050, h: 24, text: "Devon Marlowe · Principal Designer", fontFamily: "body", fontSize: 14, fontWeight: 400, color: "#ffffff", align: "center", lineHeight: 1 },
    { type: "text", x: 0, y: 430, w: 1050, h: 24, text: "(212) 555-0134 · aurelia-interiors.com", fontFamily: "body", fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.6)", align: "center", lineHeight: 1 },
  ]),
};

// ---------- Creative Portfolio Card (Business Card, 1050x600) ----------
const p29 = { pink: "#ff5c8a", purple: "#6c3fc9", ink: "#1c1530" };
const creativePortfolioCard: TemplatePreset = {
  id: "creative-portfolio-card",
  name: "Creative Portfolio Card",
  category: "Business Card",
  keywords: ["business card", "creative", "artist", "designer", "playful", "colorful"],
  doc: finalize(1050, 600, "#ffffff", [
    { type: "shape", shape: "ellipse", x: -100, y: -100, w: 320, h: 320, fill: p29.pink, radius: 0, opacity: 0.9 },
    { type: "shape", shape: "ellipse", x: 850, y: 380, w: 300, h: 300, fill: p29.purple, radius: 0, opacity: 0.85 },
    { type: "text", x: 60, y: 220, w: 700, h: 50, text: "Jordan Blake", fontFamily: "display", fontSize: 32, fontWeight: 700, color: p29.ink, align: "left", lineHeight: 1 },
    { type: "text", x: 60, y: 276, w: 700, h: 30, text: "Illustrator & Motion Designer", fontFamily: "body", fontSize: 15, fontWeight: 600, color: p29.purple, align: "left", lineHeight: 1 },
    { type: "text", x: 60, y: 420, w: 600, h: 26, text: "hello@jordanblake.art", fontFamily: "body", fontSize: 14, fontWeight: 400, color: p29.ink, align: "left", lineHeight: 1.2 },
    { type: "text", x: 60, y: 452, w: 600, h: 26, text: "@jordanblake.art", fontFamily: "body", fontSize: 14, fontWeight: 400, color: p29.ink, align: "left", lineHeight: 1.2 },
  ]),
};

// ---------- Tech Startup Card (Business Card, 1050x600) ----------
const p30 = { blue: "#155ef2", ink: "#101828", tint: "#eef3ff" };
const techStartupCard: TemplatePreset = {
  id: "tech-startup-card",
  name: "Tech Startup Card",
  category: "Business Card",
  keywords: ["business card", "tech", "startup", "saas", "clean", "modern"],
  doc: finalize(1050, 600, "#ffffff", [
    { type: "shape", shape: "rect", x: 0, y: 0, w: 1050, h: 600, fill: p30.tint, radius: 0, opacity: 1 },
    { type: "shape", shape: "rect", x: 40, y: 40, w: 60, h: 60, fill: p30.blue, radius: 16, opacity: 1 },
    { type: "text", x: 118, y: 56, w: 400, h: 30, text: "Loopwork", fontFamily: "display", fontSize: 22, fontWeight: 700, color: p30.ink, align: "left", lineHeight: 1 },
    { type: "text", x: 40, y: 260, w: 600, h: 40, text: "Priya Nair", fontFamily: "display", fontSize: 26, fontWeight: 700, color: p30.ink, align: "left", lineHeight: 1 },
    { type: "text", x: 40, y: 306, w: 600, h: 26, text: "Head of Product", fontFamily: "body", fontSize: 14.5, fontWeight: 500, color: p30.blue, align: "left", lineHeight: 1 },
    { type: "shape", shape: "rect", x: 40, y: 470, w: 970, h: 1.5, fill: "rgba(16,24,40,0.12)", radius: 0, opacity: 1 },
    { type: "text", x: 40, y: 500, w: 600, h: 24, text: "priya@loopwork.io  ·  loopwork.io", fontFamily: "body", fontSize: 13.5, fontWeight: 400, color: p30.ink, align: "left", lineHeight: 1.2 },
  ]),
};

// ---------- Team Slide (Presentation, 1920x1080) ----------
const p31 = { ink: "#151b26", mid: "#3f6d99", tint: "#eef3f9" };
const teamSlide: TemplatePreset = {
  id: "team-slide",
  name: "Team Slide",
  category: "Presentation",
  keywords: ["slide", "team", "who we are", "staff", "people", "deck"],
  doc: finalize(1920, 1080, "#ffffff", [
    { type: "text", x: 140, y: 90, w: 800, h: 26, text: "WHO WE ARE", fontFamily: "body", fontSize: 15, fontWeight: 700, color: p31.mid, align: "left", lineHeight: 1.2 },
    { type: "text", x: 140, y: 125, w: 1000, h: 80, text: "Meet the team", fontFamily: "display", fontSize: 44, fontWeight: 700, color: p31.ink, align: "left", lineHeight: 1.1 },
    { type: "shape", shape: "ellipse", x: 140, y: 300, w: 180, h: 180, fill: p31.tint, radius: 0, opacity: 1 },
    { type: "text", x: 140, y: 500, w: 300, h: 28, text: "[Name]", fontFamily: "display", fontSize: 19, fontWeight: 700, color: p31.ink, align: "center", lineHeight: 1 },
    { type: "text", x: 140, y: 532, w: 300, h: 22, text: "Founder & CEO", fontFamily: "body", fontSize: 13.5, fontWeight: 500, color: p31.mid, align: "center", lineHeight: 1 },
    { type: "shape", shape: "ellipse", x: 550, y: 300, w: 180, h: 180, fill: p31.tint, radius: 0, opacity: 1 },
    { type: "text", x: 550, y: 500, w: 300, h: 28, text: "[Name]", fontFamily: "display", fontSize: 19, fontWeight: 700, color: p31.ink, align: "center", lineHeight: 1 },
    { type: "text", x: 550, y: 532, w: 300, h: 22, text: "Head of Design", fontFamily: "body", fontSize: 13.5, fontWeight: 500, color: p31.mid, align: "center", lineHeight: 1 },
    { type: "shape", shape: "ellipse", x: 960, y: 300, w: 180, h: 180, fill: p31.tint, radius: 0, opacity: 1 },
    { type: "text", x: 960, y: 500, w: 300, h: 28, text: "[Name]", fontFamily: "display", fontSize: 19, fontWeight: 700, color: p31.ink, align: "center", lineHeight: 1 },
    { type: "text", x: 960, y: 532, w: 300, h: 22, text: "Head of Engineering", fontFamily: "body", fontSize: 13.5, fontWeight: 500, color: p31.mid, align: "center", lineHeight: 1 },
    { type: "shape", shape: "ellipse", x: 1370, y: 300, w: 180, h: 180, fill: p31.tint, radius: 0, opacity: 1 },
    { type: "text", x: 1370, y: 500, w: 300, h: 28, text: "[Name]", fontFamily: "display", fontSize: 19, fontWeight: 700, color: p31.ink, align: "center", lineHeight: 1 },
    { type: "text", x: 1370, y: 532, w: 300, h: 22, text: "Head of Growth", fontFamily: "body", fontSize: 13.5, fontWeight: 500, color: p31.mid, align: "center", lineHeight: 1 },
  ]),
};

// ---------- Pricing Slide (Presentation, 1920x1080) ----------
const p32 = { ink: "#151b26", mid: "#2f6fed", tint: "#eef3ff" };
const pricingSlide: TemplatePreset = {
  id: "pricing-slide",
  name: "Pricing Slide",
  category: "Presentation",
  keywords: ["slide", "pricing", "plans", "tiers", "packages", "deck"],
  doc: finalize(1920, 1080, "#ffffff", [
    { type: "text", x: 140, y: 90, w: 800, h: 60, text: "Simple, transparent pricing", fontFamily: "display", fontSize: 40, fontWeight: 700, color: p32.ink, align: "left", lineHeight: 1.1 },
    { type: "shape", shape: "rect", x: 140, y: 230, w: 500, h: 700, fill: p32.tint, radius: 18, opacity: 1 },
    { type: "text", x: 180, y: 280, w: 420, h: 30, text: "Starter", fontFamily: "display", fontSize: 20, fontWeight: 700, color: p32.ink, align: "left", lineHeight: 1 },
    { type: "text", x: 180, y: 330, w: 420, h: 60, text: "$29/mo", fontFamily: "display", fontSize: 40, fontWeight: 700, color: p32.ink, align: "left", lineHeight: 1 },
    { type: "text", x: 180, y: 420, w: 420, h: 120, text: "For individuals just getting started.", fontFamily: "body", fontSize: 16, fontWeight: 400, color: "#5c6b7a", align: "left", lineHeight: 1.5 },
    { type: "shape", shape: "rect", x: 710, y: 190, w: 500, h: 780, fill: p32.mid, radius: 18, opacity: 1 },
    { type: "text", x: 750, y: 240, w: 420, h: 30, text: "Pro", fontFamily: "display", fontSize: 20, fontWeight: 700, color: "#ffffff", align: "left", lineHeight: 1 },
    { type: "text", x: 750, y: 290, w: 420, h: 60, text: "$79/mo", fontFamily: "display", fontSize: 40, fontWeight: 700, color: "#ffffff", align: "left", lineHeight: 1 },
    { type: "text", x: 750, y: 380, w: 420, h: 120, text: "For growing teams that need more.", fontFamily: "body", fontSize: 16, fontWeight: 400, color: "rgba(255,255,255,0.85)", align: "left", lineHeight: 1.5 },
    { type: "shape", shape: "rect", x: 1280, y: 230, w: 500, h: 700, fill: p32.tint, radius: 18, opacity: 1 },
    { type: "text", x: 1320, y: 280, w: 420, h: 30, text: "Enterprise", fontFamily: "display", fontSize: 20, fontWeight: 700, color: p32.ink, align: "left", lineHeight: 1 },
    { type: "text", x: 1320, y: 330, w: 420, h: 60, text: "Custom", fontFamily: "display", fontSize: 40, fontWeight: 700, color: p32.ink, align: "left", lineHeight: 1 },
    { type: "text", x: 1320, y: 420, w: 420, h: 120, text: "Dedicated support, custom SLAs.", fontFamily: "body", fontSize: 16, fontWeight: 400, color: "#5c6b7a", align: "left", lineHeight: 1.5 },
  ]),
};

// ---------- Roadmap Slide (Presentation, 1920x1080) ----------
const p33 = { ink: "#151b26", mid: "#3f6d99", line: "#d7e0ea" };
const roadmapSlide: TemplatePreset = {
  id: "roadmap-slide",
  name: "Roadmap Slide",
  category: "Presentation",
  keywords: ["slide", "roadmap", "timeline", "plan", "milestones", "deck"],
  doc: finalize(1920, 1080, "#ffffff", [
    { type: "text", x: 140, y: 90, w: 800, h: 60, text: "Where we're headed", fontFamily: "display", fontSize: 40, fontWeight: 700, color: p33.ink, align: "left", lineHeight: 1.1 },
    { type: "shape", shape: "line", x: 140, y: 500, w: 1640, h: 3, fill: p33.line, radius: 0, opacity: 1 },
    { type: "shape", shape: "ellipse", x: 216, y: 486, w: 30, h: 30, fill: p33.mid, radius: 0, opacity: 1 },
    { type: "text", x: 140, y: 540, w: 340, h: 26, text: "Q1", fontFamily: "display", fontSize: 16, fontWeight: 700, color: p33.mid, align: "left", lineHeight: 1 },
    { type: "text", x: 140, y: 574, w: 340, h: 80, text: "Launch core platform to first 50 customers", fontFamily: "body", fontSize: 16, fontWeight: 400, color: "#5c6b7a", align: "left", lineHeight: 1.4 },
    { type: "shape", shape: "ellipse", x: 636, y: 486, w: 30, h: 30, fill: p33.mid, radius: 0, opacity: 1 },
    { type: "text", x: 560, y: 540, w: 340, h: 26, text: "Q2", fontFamily: "display", fontSize: 16, fontWeight: 700, color: p33.mid, align: "left", lineHeight: 1 },
    { type: "text", x: 560, y: 574, w: 340, h: 80, text: "Ship integrations and mobile app", fontFamily: "body", fontSize: 16, fontWeight: 400, color: "#5c6b7a", align: "left", lineHeight: 1.4 },
    { type: "shape", shape: "ellipse", x: 1056, y: 486, w: 30, h: 30, fill: p33.mid, radius: 0, opacity: 1 },
    { type: "text", x: 980, y: 540, w: 340, h: 26, text: "Q3", fontFamily: "display", fontSize: 16, fontWeight: 700, color: p33.mid, align: "left", lineHeight: 1 },
    { type: "text", x: 980, y: 574, w: 340, h: 80, text: "Expand to enterprise, SOC 2 audit", fontFamily: "body", fontSize: 16, fontWeight: 400, color: "#5c6b7a", align: "left", lineHeight: 1.4 },
    { type: "shape", shape: "ellipse", x: 1476, y: 486, w: 30, h: 30, fill: p33.mid, radius: 0, opacity: 1 },
    { type: "text", x: 1400, y: 540, w: 340, h: 26, text: "Q4", fontFamily: "display", fontSize: 16, fontWeight: 700, color: p33.mid, align: "left", lineHeight: 1 },
    { type: "text", x: 1400, y: 574, w: 340, h: 80, text: "International launch", fontFamily: "body", fontSize: 16, fontWeight: 400, color: "#5c6b7a", align: "left", lineHeight: 1.4 },
  ]),
};

// ---------- Contact Slide (Presentation, 1920x1080) ----------
const p34 = { bg: "#151b26", mid: "#3f6d99" };
const contactSlide: TemplatePreset = {
  id: "contact-slide",
  name: "Contact Slide",
  category: "Presentation",
  keywords: ["slide", "contact", "thank you", "closing", "get in touch", "deck"],
  doc: finalize(1920, 1080, p34.bg, [
    { type: "shape", shape: "ellipse", x: 1500, y: -100, w: 500, h: 500, fill: p34.mid, radius: 0, opacity: 0.16 },
    { type: "text", x: 140, y: 380, w: 1200, h: 130, text: "Let's talk", fontFamily: "display", fontSize: 72, fontWeight: 700, color: "#ffffff", align: "left", lineHeight: 1 },
    { type: "shape", shape: "line", x: 140, y: 530, w: 60, h: 3, fill: p34.mid, radius: 0, opacity: 1 },
    { type: "text", x: 140, y: 560, w: 800, h: 30, text: "[hello@yourcompany.com]", fontFamily: "body", fontSize: 20, fontWeight: 500, color: "rgba(255,255,255,0.85)", align: "left", lineHeight: 1.2 },
    { type: "text", x: 140, y: 600, w: 800, h: 30, text: "[yourcompany.com]", fontFamily: "body", fontSize: 20, fontWeight: 500, color: "rgba(255,255,255,0.6)", align: "left", lineHeight: 1.2 },
  ]),
};

// ---------- Photographer Portfolio Post (Social Post, 1080x1080) ----------
const p35 = { black: "#0a0a0a", cream: "#f2ede4" };
const photographerPortfolio: TemplatePreset = {
  id: "photographer-portfolio",
  name: "Photographer Portfolio Post",
  category: "Social Post",
  keywords: ["photographer", "photography", "portfolio", "moody", "gallery"],
  doc: finalize(1080, 1080, p35.black, [
    { type: "text", x: 0, y: 70, w: 1080, h: 30, text: "[PHOTOGRAPHER NAME]", fontFamily: "body", fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.6)", align: "center", lineHeight: 1.2 },
    ...rePhotoPlaceholder(90, 130, 900, 780).map((el) => (el.type === "shape" ? { ...el, fill: "#1c1c1c", stroke: "rgba(255,255,255,0.3)" } : { ...el, color: "rgba(255,255,255,0.5)" })),
    { type: "text", x: 0, y: 960, w: 1080, h: 30, text: "Portfolio at [website.com] · @[Instagram handle]", fontFamily: "body", fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.55)", align: "center", lineHeight: 1.2 },
  ]),
};

// ---------- Yoga & Wellness Post (Social Post, 1080x1080) ----------
const p36 = { sage: "#5c7a63", tint: "#eef3ea", ink: "#3c4a3f" };
const yogaWellnessPost: TemplatePreset = {
  id: "yoga-wellness-post",
  name: "Yoga & Wellness Class",
  category: "Social Post",
  keywords: ["yoga", "wellness", "meditation", "studio", "class", "calm", "mindfulness"],
  doc: finalize(1080, 1080, p36.tint, [
    ...bizHeader(p36.sage, "leaf", "New Session"),
    { type: "shape", shape: "ellipse", x: 390, y: 200, w: 300, h: 300, fill: "#ffffff", radius: 0, opacity: 1 },
    { type: "icon", x: 490, y: 300, w: 100, h: 100, icon: "leaf", color: p36.sage },
    { type: "text", x: 90, y: 560, w: 900, h: 60, text: "Find your breath again", fontFamily: "display", fontSize: 38, fontWeight: 700, color: p36.ink, align: "center", lineHeight: 1.1 },
    { type: "text", x: 190, y: 640, w: 700, h: 60, text: "Gentle flow · all levels welcome · mats provided", fontFamily: "body", fontSize: 15.5, fontWeight: 400, color: "#6b7d70", align: "center", lineHeight: 1.5 },
    { type: "shape", shape: "rect", x: 240, y: 800, w: 600, h: 74, fill: p36.sage, radius: 37, opacity: 1 },
    { type: "text", x: 240, y: 826, w: 600, h: 26, text: "Reserve your mat — link in bio", fontFamily: "display", fontSize: 16, fontWeight: 600, color: "#ffffff", align: "center", lineHeight: 1 },
    ...bizFooter(p36.sage),
  ]),
};

// ---------- Auto Detailing Promo (Social Post, 1080x1080) ----------
const p37 = { black: "#111214", red: "#d61f26", tint: "#f2f2f2" };
const autoDetailingPromo: TemplatePreset = {
  id: "auto-detailing-promo",
  name: "Auto Detailing Promo",
  category: "Social Post",
  keywords: ["auto detailing", "car wash", "car detailing", "automotive", "shine"],
  doc: finalize(1080, 1080, p37.black, [
    { type: "icon", x: 40, y: 40, w: 34, h: 34, icon: "car", color: p37.red },
    { type: "text", x: 90, y: 46, w: 500, h: 30, text: "[Business Name]", fontFamily: "display", fontSize: 18, fontWeight: 700, color: "#ffffff", align: "left", lineHeight: 1.2 },
    { type: "text", x: 60, y: 160, w: 960, h: 200, text: "Showroom Shine", fontFamily: "display", fontSize: 72, fontWeight: 700, color: "#ffffff", align: "left", lineHeight: 1 },
    { type: "text", x: 60, y: 320, w: 800, h: 40, text: "Full interior + exterior detail, done right.", fontFamily: "body", fontSize: 19, fontWeight: 400, color: "rgba(255,255,255,0.7)", align: "left", lineHeight: 1.3 },
    { type: "shape", shape: "rect", x: 60, y: 420, w: 960, h: 400, fill: p37.tint, radius: 16, opacity: 1 },
    { type: "shape", shape: "rect", x: 60, y: 860, w: 960, h: 90, fill: p37.red, radius: 14, opacity: 1 },
    { type: "text", x: 60, y: 888, w: 960, h: 34, text: "Book this week — 15% off full detail", fontFamily: "display", fontSize: 20, fontWeight: 700, color: "#ffffff", align: "center", lineHeight: 1.2 },
    { type: "text", x: 0, y: 1000, w: 1080, h: 26, text: "[Phone] · @[Instagram handle]", fontFamily: "body", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.55)", align: "center", lineHeight: 1.2 },
  ]),
};

// ---------- Pet Grooming Post (Social Post, 1080x1080) ----------
const p38 = { teal: "#1f7a72", peach: "#ffd9b3", ink: "#2e4a46" };
const petGroomingPost: TemplatePreset = {
  id: "pet-grooming-post",
  name: "Pet Grooming Promo",
  category: "Social Post",
  keywords: ["pet grooming", "dog groomer", "pet care", "pet spa", "grooming"],
  doc: finalize(1080, 1080, "#ffffff", [
    ...bizHeader(p38.teal, "paw", "Book a Groom"),
    { type: "shape", shape: "ellipse", x: 340, y: 140, w: 400, h: 400, fill: p38.peach, radius: 0, opacity: 1 },
    { type: "icon", x: 490, y: 290, w: 100, h: 100, icon: "paw", color: p38.teal },
    { type: "text", x: 90, y: 580, w: 900, h: 60, text: "Fresh cut, happy pup", fontFamily: "display", fontSize: 38, fontWeight: 700, color: p38.ink, align: "center", lineHeight: 1.1 },
    { type: "text", x: 190, y: 660, w: 700, h: 50, text: "Bath, trim, nails & ears — all in one visit.", fontFamily: "body", fontSize: 15.5, fontWeight: 400, color: "#5c7370", align: "center", lineHeight: 1.4 },
    { type: "shape", shape: "rect", x: 240, y: 800, w: 600, h: 74, fill: p38.teal, radius: 37, opacity: 1 },
    { type: "text", x: 240, y: 826, w: 600, h: 26, text: "Book your pup's appointment today", fontFamily: "display", fontSize: 15.5, fontWeight: 600, color: "#ffffff", align: "center", lineHeight: 1 },
    ...bizFooter(p38.teal),
  ]),
};

// ---------- Garage Sale Flyer (Flyer, 1080x1350) ----------
const p39 = { yellow: "#f4c430", ink: "#1c1508", brown: "#5a3e1b" };
const garageSaleFlyer: TemplatePreset = {
  id: "garage-sale-flyer",
  name: "Garage Sale Flyer",
  category: "Flyer",
  keywords: ["garage sale", "yard sale", "community", "moving sale", "estate sale"],
  doc: finalize(1080, 1350, p39.yellow, [
    { type: "text", x: 60, y: 100, w: 960, h: 160, text: "HUGE GARAGE SALE", fontFamily: "display", fontSize: 58, fontWeight: 700, color: p39.ink, align: "center", lineHeight: 1.1 },
    { type: "shape", shape: "line", x: 390, y: 280, w: 300, h: 4, fill: p39.ink, radius: 0, opacity: 1 },
    { type: "shape", shape: "rect", x: 60, y: 340, w: 960, h: 560, fill: "#ffffff", radius: 16, opacity: 1, stroke: p39.ink, strokeWidth: 2 },
    { type: "text", x: 60, y: 940, w: 960, h: 34, text: "Saturday, Sept 13 · 8 AM – 2 PM", fontFamily: "display", fontSize: 24, fontWeight: 700, color: p39.brown, align: "center", lineHeight: 1.2 },
    { type: "text", x: 60, y: 990, w: 960, h: 30, text: "412 Willow Creek Rd — rain or shine", fontFamily: "body", fontSize: 17, fontWeight: 500, color: p39.ink, align: "center", lineHeight: 1.2 },
    { type: "shape", shape: "rect", x: 0, y: 1180, w: 1080, h: 170, fill: p39.ink, radius: 0, opacity: 1 },
    { type: "text", x: 60, y: 1220, w: 960, h: 34, text: "Furniture · Toys · Tools · Clothes · and more", fontFamily: "display", fontSize: 20, fontWeight: 600, color: p39.yellow, align: "center", lineHeight: 1.3 },
    { type: "text", x: 60, y: 1270, w: 960, h: 26, text: "Everything must go!", fontFamily: "body", fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.8)", align: "center", lineHeight: 1.2 },
  ]),
};

// ---------- Concert / Music Event Flyer (Flyer, 1080x1350) ----------
const p40 = { black: "#0a0a0f", violet: "#8b5cf6", cyan: "#3fd9d9" };
const concertFlyer: TemplatePreset = {
  id: "concert-event-flyer",
  name: "Concert Event Flyer",
  category: "Flyer",
  keywords: ["concert", "music", "event", "live show", "gig", "festival", "party"],
  doc: finalize(1080, 1350, p40.black, [
    { type: "shape", shape: "ellipse", x: -200, y: -200, w: 600, h: 600, fill: p40.violet, radius: 0, opacity: 0.25 },
    { type: "shape", shape: "ellipse", x: 700, y: 900, w: 560, h: 560, fill: p40.cyan, radius: 0, opacity: 0.18 },
    { type: "icon", x: 60, y: 90, w: 32, h: 32, icon: "music", color: p40.cyan },
    { type: "text", x: 110, y: 96, w: 500, h: 30, text: "LIVE AT THE VENUE", fontFamily: "body", fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.7)", align: "left", lineHeight: 1.2 },
    { type: "text", x: 60, y: 200, w: 960, h: 260, text: "Night Pulse Tour", fontFamily: "display", fontSize: 68, fontWeight: 700, color: "#ffffff", align: "left", lineHeight: 1.08 },
    { type: "text", x: 60, y: 460, w: 800, h: 40, text: "with special guests THE LOW END", fontFamily: "body", fontSize: 19, fontWeight: 400, color: p40.cyan, align: "left", lineHeight: 1.3 },
    { type: "shape", shape: "rect", x: 60, y: 560, w: 960, h: 480, fill: "rgba(255,255,255,0.05)", radius: 16, opacity: 1, stroke: "rgba(255,255,255,0.15)", strokeWidth: 1 },
    { type: "shape", shape: "rect", x: 60, y: 1080, w: 960, h: 100, fill: p40.violet, radius: 0, opacity: 1 },
    { type: "text", x: 60, y: 1108, w: 960, h: 40, text: "Sat, Oct 24 · Doors 7PM · Tickets $25", fontFamily: "display", fontSize: 20, fontWeight: 700, color: "#ffffff", align: "center", lineHeight: 1.2 },
    { type: "text", x: 0, y: 1230, w: 1080, h: 26, text: "Tickets at [website.com/tickets]", fontFamily: "body", fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.6)", align: "center", lineHeight: 1.2 },
  ]),
};

// ---------- Kids Event Flyer (Flyer, 1080x1350) ----------
const p41 = { blue: "#2f8fd6", yellow: "#ffcb3d", coral: "#ff7a5c", cream: "#fff8ec" };
const kidsEventFlyer: TemplatePreset = {
  id: "kids-event-flyer",
  name: "Kids Event Flyer",
  category: "Flyer",
  keywords: ["kids event", "family", "school", "carnival", "story time", "children"],
  doc: finalize(1080, 1350, p41.cream, [
    { type: "shape", shape: "ellipse", x: 60, y: 80, w: 120, h: 120, fill: p41.yellow, radius: 0, opacity: 1 },
    { type: "shape", shape: "ellipse", x: 900, y: 140, w: 90, h: 90, fill: p41.coral, radius: 0, opacity: 1 },
    { type: "shape", shape: "ellipse", x: 820, y: 40, w: 60, h: 60, fill: p41.blue, radius: 0, opacity: 1 },
    { type: "text", x: 60, y: 240, w: 960, h: 160, text: "Family Fun Day!", fontFamily: "display", fontSize: 60, fontWeight: 700, color: p41.blue, align: "center", lineHeight: 1.1 },
    { type: "text", x: 140, y: 400, w: 800, h: 60, text: "Games, face painting, and a petting zoo — free for the whole family.", fontFamily: "body", fontSize: 18, fontWeight: 500, color: "#5c4a3a", align: "center", lineHeight: 1.5 },
    { type: "shape", shape: "rect", x: 90, y: 520, w: 900, h: 500, fill: "#ffffff", radius: 24, opacity: 1, stroke: p41.blue, strokeWidth: 3 },
    { type: "shape", shape: "rect", x: 0, y: 1120, w: 1080, h: 130, fill: p41.coral, radius: 0, opacity: 1 },
    { type: "text", x: 60, y: 1155, w: 960, h: 34, text: "Saturday, Oct 4 · 10 AM – 2 PM", fontFamily: "display", fontSize: 22, fontWeight: 700, color: "#ffffff", align: "center", lineHeight: 1.2 },
    { type: "text", x: 60, y: 1200, w: 960, h: 26, text: "Lincoln Elementary Playground", fontFamily: "body", fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.85)", align: "center", lineHeight: 1.2 },
  ]),
};

// ---------- Holiday Sale Flyer (Flyer, 1080x1350) ----------
const p42 = { green: "#123f2c", red: "#b5232f", cream: "#f7efdf", gold: "#d9a441" };
const holidaySaleFlyer: TemplatePreset = {
  id: "holiday-sale-flyer",
  name: "Holiday Sale Flyer",
  category: "Flyer",
  keywords: ["holiday", "christmas", "seasonal sale", "winter sale", "gift", "festive"],
  doc: finalize(1080, 1350, p42.green, [
    { type: "icon", x: 60, y: 80, w: 30, h: 30, icon: "gift", color: p42.gold },
    { type: "text", x: 110, y: 86, w: 500, h: 28, text: "[Business Name]", fontFamily: "display", fontSize: 17, fontWeight: 700, color: "#ffffff", align: "left", lineHeight: 1.2 },
    { type: "text", x: 60, y: 180, w: 960, h: 40, text: "HOLIDAY SALE", fontFamily: "body", fontSize: 18, fontWeight: 700, color: p42.gold, align: "left", lineHeight: 1.2 },
    { type: "text", x: 60, y: 230, w: 960, h: 200, text: "Season's Savings", fontFamily: "display", fontSize: 64, fontWeight: 700, color: "#ffffff", align: "left", lineHeight: 1.1 },
    { type: "shape", shape: "rect", x: 60, y: 460, w: 960, h: 130, fill: p42.red, radius: 16, opacity: 1 },
    { type: "text", x: 60, y: 496, w: 960, h: 60, text: "Up to 30% off storewide", fontFamily: "display", fontSize: 30, fontWeight: 700, color: "#ffffff", align: "center", lineHeight: 1.2 },
    { type: "shape", shape: "rect", x: 60, y: 630, w: 960, h: 460, fill: p42.cream, radius: 16, opacity: 1 },
    { type: "text", x: 60, y: 1140, w: 960, h: 34, text: "Now through Dec 31", fontFamily: "display", fontSize: 22, fontWeight: 700, color: p42.gold, align: "center", lineHeight: 1.2 },
    { type: "text", x: 0, y: 1230, w: 1080, h: 30, text: "[website.com] · @[Instagram handle]", fontFamily: "body", fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.65)", align: "center", lineHeight: 1.2 },
  ]),
};

export const templatePresets: TemplatePreset[] = [
  localTipPubmat,
  justListed,
  justSold,
  openHouse,
  marketUpdate,
  clientTestimonial,
  meetTheAgent,
  mythVsFact,
  motivationalQuote,
  productAnnouncement,
  eventFlyer,
  workshopPoster,
  iconLockup,
  wordmarkBadge,
  bizCardModern,
  minimalCard,
  pitchDeck,
  statHighlightSlide,
  cafeDailySpecial,
  fitnessSchedule,
  salonServiceMenu,
  restaurantFeaturedDish,
  donationDrive,
  tutoringBooking,
  cleaningServiceBooking,
  ecommerceFlashSale,
  lawFirmConsultation,
  podcastEpisode,
  webinarRegistration,
  celebrationSale,
  emblemLogo,
  geometricMark,
  scriptWordmark,
  stackedIconLogo,
  boldColorBlockCard,
  luxuryGoldCard,
  creativePortfolioCard,
  techStartupCard,
  teamSlide,
  pricingSlide,
  roadmapSlide,
  contactSlide,
  photographerPortfolio,
  yogaWellnessPost,
  autoDetailingPromo,
  petGroomingPost,
  garageSaleFlyer,
  concertFlyer,
  kidsEventFlyer,
  holidaySaleFlyer,
];

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

/** A truly blank, single-page canvas at the right size for a category — start from nothing. */
export function blankDoc(category: TemplateCategory): CanvasDoc {
  const { w, h, bg } = BLANK_SIZE[category];
  return { width: w, height: h, pages: [{ id: "page-1", background: bg, elements: [] }] };
}

/** A blank page sized to match an existing doc — used when adding a new page/slide in the editor. */
export function blankPage(id: string, background = "#ffffff"): CanvasPage {
  return { id, background, elements: [] };
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

/**
 * Reflects the VA's prompt in whatever reads as the design's main headline
 * — its largest REAL text element, on the first page. Only a genuine
 * multi-word phrase qualifies: on most templates the biggest font belongs
 * to a price, a stat number, or a decorative quote mark, none of which
 * read as a headline. Mutates `doc` in place.
 */
export function applyPromptHeadline(doc: CanvasDoc, promptText: string): void {
  if (!promptText.trim()) return;
  const headline = guessHeadline(promptText);
  const elements = doc.pages[0].elements;
  const looksLikeHeadline = (text: string) => text.trim().length >= 4 && /\s/.test(text.trim());
  let target: DesignElement | undefined;
  for (const el of elements) {
    if (
      el.type === "text" &&
      looksLikeHeadline(el.text) &&
      (!target || (target.type === "text" && el.fontSize > target.fontSize))
    ) {
      target = el;
    }
  }
  if (target && target.type === "text") target.text = headline;
}

/**
 * Finds the element that plays "the brand mark" on a template's first page
 * — either a big centered hero icon (an Icon Lockup-style logo) or a small
 * icon sitting in the header's top-left corner — so an uploaded logo can
 * drop straight into that slot instead of landing as a generic overlay.
 * Computed from the built doc, not hardcoded per template, so it keeps
 * working as templates change.
 */
function findLogoSlotIndex(doc: CanvasDoc): number | undefined {
  const els = doc.pages[0].elements;
  let best = -1;
  let bestScore = -Infinity;
  els.forEach((el, i) => {
    if (el.type !== "icon") return;
    const isHeroMark = el.w >= 100 && el.h >= 100;
    const isHeaderMark = el.y < 100 && el.x < 200 && el.w <= 60;
    if (!isHeroMark && !isHeaderMark) return;
    const score = isHeroMark ? 100 : 50 - el.y;
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  });
  return best >= 0 ? best : undefined;
}

/**
 * Drops an uploaded logo into a template's brand-mark slot when it has one
 * (replacing that icon with the logo image, same box), or failing that
 * adds it as a small corner badge — always does *something* useful with
 * the logo rather than silently dropping it. Mutates `doc` in place.
 */
export function applyLogo(doc: CanvasDoc, logoDataUrl: string): void {
  const page = doc.pages[0];
  const idx = findLogoSlotIndex(doc);
  if (idx !== undefined) {
    const base = page.elements[idx];
    const radius = base.type === "shape" || base.type === "image" ? base.radius : Math.round(Math.min(base.w, base.h) * 0.15);
    page.elements[idx] = {
      id: base.id,
      x: base.x,
      y: base.y,
      w: base.w,
      h: base.h,
      rotation: base.rotation,
      zIndex: base.zIndex,
      type: "image",
      src: logoDataUrl,
      radius,
    };
    return;
  }
  const size = Math.max(60, Math.min(140, Math.round(doc.width * 0.09)));
  const z = page.elements.reduce((m, e) => Math.max(m, e.zIndex), 0) + 1;
  page.elements.push({ id: newElId(), x: 28, y: 28, w: size, h: size, rotation: 0, zIndex: z, type: "image", src: logoDataUrl, radius: 10 });
}
