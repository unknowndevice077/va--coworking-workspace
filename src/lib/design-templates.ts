// The Smart Design Template Engine's library.
// This is intentionally NOT generative AI: it is a curated library of
// professionally designed templates, matched to a VA's plain-text prompt
// by keyword scoring (see match-template.ts). Every result is a real,
// pre-built template with text/image "slots" filled in from the prompt —
// never a generated image. Keep the UI copy honest about that ("Smart
// Templates", "matched instantly from our library") — see MEMORY / the
// product brief for why.

export type TemplateCategory =
  | "Logo"
  | "Social Post"
  | "Flyer"
  | "Business Card"
  | "Presentation";

export interface DesignTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  /** Lowercase keywords this template matches against a prompt. */
  keywords: string[];
  /** Hue (0-360) used to render this template's placeholder art in an OKLCH accent. */
  hue: number;
  /** A single inline-SVG path (24x24 viewBox, stroke-based) used as the template's glyph. */
  iconPath: string;
}

export const designTemplates: DesignTemplate[] = [
  // --- Logo ---
  {
    id: "logo-minimal-mark",
    name: "Minimal Mark",
    category: "Logo",
    keywords: ["logo", "brand", "mark", "minimal", "simple", "icon"],
    hue: 150,
    iconPath: "M12 6v12M6 12h12 M12 12m-6 0a6 6 0 1 0 12 0a6 6 0 1 0 -12 0",
  },
  {
    id: "logo-emblem-badge",
    name: "Emblem Badge",
    category: "Logo",
    keywords: ["logo", "badge", "emblem", "crest", "gym", "fitness", "club", "sports"],
    hue: 120,
    iconPath: "M12 3l7 4v6c0 4-3 7-7 8-4-1-7-4-7-8V7Z",
  },
  {
    id: "logo-wordmark",
    name: "Bold Wordmark",
    category: "Logo",
    keywords: ["logo", "wordmark", "text", "typography", "name", "studio"],
    hue: 30,
    iconPath: "M4 18V6h4l4 8 4-8h4v12",
  },
  {
    id: "logo-monogram",
    name: "Monogram",
    category: "Logo",
    keywords: ["logo", "monogram", "initials", "letter", "law", "firm", "professional"],
    hue: 255,
    iconPath: "M6 18V6h6a4 4 0 0 1 0 8H6 M12 14l6 4",
  },

  // --- Social Post ---
  {
    id: "social-bold-announcement",
    name: "Bold Announcement",
    category: "Social Post",
    keywords: ["announcement", "instagram", "post", "menu", "launch", "new", "bakery"],
    hue: 340,
    iconPath: "M4 15l4-4 4 4 3-3 5 5 M3 4h18v13H3Z",
  },
  {
    id: "social-seasonal-promo",
    name: "Seasonal Promo",
    category: "Social Post",
    keywords: ["seasonal", "sale", "promo", "discount", "fall", "holiday", "summer", "instagram"],
    hue: 200,
    iconPath: "M3 12l4-8 4 8 4-8 4 8 M3 17h18",
  },
  {
    id: "social-quote-card",
    name: "Quote Card",
    category: "Social Post",
    keywords: ["quote", "testimonial", "review", "instagram", "post", "inspiration"],
    hue: 280,
    iconPath: "M7 8c-2 0-3 1.5-3 3.5S5 15 7 15 M7 15v3 M17 8c-2 0-3 1.5-3 3.5s1 3.5 3 3.5 M17 15v3",
  },
  {
    id: "social-event-invite",
    name: "Community Event",
    category: "Social Post",
    keywords: ["event", "invite", "community", "meetup", "class", "workshop"],
    hue: 340,
    iconPath: "M8 9a2.5 2.5 0 1 1 0 0.01Z M16 9a2.5 2.5 0 1 1 0 0.01Z M4 19c0-3 2.5-5 4-5 M20 19c0-3-2.5-5-4-5",
  },

  // --- Flyer ---
  {
    id: "flyer-grand-opening",
    name: "Grand Opening Sale",
    category: "Flyer",
    keywords: ["flyer", "opening", "sale", "new", "store", "shop", "launch"],
    hue: 55,
    iconPath: "M4 20V9l8-5 8 5v11 M9 20v-6h6v6",
  },
  {
    id: "flyer-open-house",
    name: "Open House",
    category: "Flyer",
    keywords: ["flyer", "open house", "real estate", "realty", "property", "home", "listing"],
    hue: 200,
    iconPath: "M3 11l9-7 9 7 M5 10v9h14v-9",
  },
  {
    id: "flyer-community-event",
    name: "Community Event",
    category: "Flyer",
    keywords: ["flyer", "event", "community", "fundraiser", "festival"],
    hue: 340,
    iconPath: "M8 9a2.5 2.5 0 1 1 0 0.01Z M16 9a2.5 2.5 0 1 1 0 0.01Z M4 19c0-3 2.5-5 4-5 M20 19c0-3-2.5-5-4-5",
  },
  {
    id: "flyer-class-workshop",
    name: "Class & Workshop",
    category: "Flyer",
    keywords: ["flyer", "class", "workshop", "training", "session", "fitness", "studio"],
    hue: 120,
    iconPath: "M4 6h16v10H4Z M8 20h8 M12 16v4",
  },

  // --- Business Card ---
  {
    id: "card-modern-contact",
    name: "Modern Contact Card",
    category: "Business Card",
    keywords: ["business card", "card", "contact", "modern"],
    hue: 265,
    iconPath: "M3 6h18v12H3Z M7 15h4",
  },
  {
    id: "card-minimal-line",
    name: "Minimal Line",
    category: "Business Card",
    keywords: ["business card", "card", "minimal", "clean"],
    hue: 150,
    iconPath: "M3 6h18v12H3Z M6 10h12 M6 14h6",
  },
  {
    id: "card-law-firm",
    name: "Professional Monogram",
    category: "Business Card",
    keywords: ["business card", "card", "law", "firm", "professional", "attorney"],
    hue: 255,
    iconPath: "M3 6h18v12H3Z M9 15V9h3a2 2 0 0 1 0 4H9",
  },

  // --- Presentation ---
  {
    id: "deck-pitch-cover",
    name: "Pitch Deck Cover",
    category: "Presentation",
    keywords: ["presentation", "deck", "pitch", "slides", "cover"],
    hue: 25,
    iconPath: "M3 4h18v13H3Z M8 21h8M12 17v4",
  },
  {
    id: "deck-quarterly-report",
    name: "Quarterly Report",
    category: "Presentation",
    keywords: ["presentation", "deck", "report", "quarterly", "review", "slides"],
    hue: 200,
    iconPath: "M3 4h18v13H3Z M7 14v-4 M12 14V8 M17 14v-6",
  },
  {
    id: "deck-onboarding",
    name: "Client Onboarding",
    category: "Presentation",
    keywords: ["presentation", "deck", "onboarding", "welcome", "kickoff", "slides"],
    hue: 340,
    iconPath: "M3 4h18v13H3Z M9 10.5h6 M9 13.5h4",
  },
];

export const templateCategories: TemplateCategory[] = [
  "Logo",
  "Social Post",
  "Flyer",
  "Business Card",
  "Presentation",
];
