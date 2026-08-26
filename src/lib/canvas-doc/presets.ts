import type { CanvasDoc, CanvasPage, DesignElement, DistributiveOmit, TemplateCategory, TemplatePreset } from "./types";

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
