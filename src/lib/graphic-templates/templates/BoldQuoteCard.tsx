import { EditableText } from "@/components/graphic/EditableText";
import { paletteFromHue } from "../palette";
import { fonts } from "../parts";
import type { GraphicProps, GraphicTemplateDef } from "../types";

function BoldQuoteCardGraphic({ values: v, hue, editable, onEdit }: GraphicProps) {
  const p = paletteFromHue(hue);
  const edit = (key: string) => (val: string) => onEdit?.(key, val);
  const initials = v.authorName
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div style={{ width: "100%", height: "100%", background: p.deep, color: "#fff", display: "flex", flexDirection: "column", fontFamily: fonts.body, padding: "64px 72px", position: "relative", overflow: "hidden" }}>
      <svg width="120" height="90" viewBox="0 0 48 36" style={{ opacity: 0.28, marginBottom: 8 }}>
        <path d="M0 22c0-9 6-16 15-18l2 5c-6 2-9 6-9 11h9v13H0Z" fill="#fff" />
        <path d="M22 22c0-9 6-16 15-18l2 5c-6 2-9 6-9 11h9v13H22Z" fill="#fff" />
      </svg>

      <EditableText
        as="h1"
        value={v.quote}
        editable={editable}
        onEdit={edit("quote")}
        style={{ fontFamily: fonts.display, fontWeight: 600, fontSize: 46, lineHeight: 1.25, letterSpacing: "-0.01em", margin: 0, maxWidth: 900, flex: 1 }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 40 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.16)", border: "1.5px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fonts.display, fontWeight: 700, fontSize: 19, flexShrink: 0 }}>
          {initials || "?"}
        </div>
        <div>
          <EditableText value={v.authorName} editable={editable} onEdit={edit("authorName")} style={{ fontWeight: 700, fontSize: 18, display: "block" }} />
          <EditableText value={v.authorTitle} editable={editable} onEdit={edit("authorTitle")} style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, display: "block", marginTop: 2 }} />
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 28, right: 40 }}>
        <EditableText value={v.brandTag} editable={editable} onEdit={edit("brandTag")} style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", color: "rgba(255,255,255,0.55)" }} />
      </div>
    </div>
  );
}

export const boldQuoteCard: GraphicTemplateDef = {
  id: "bold-quote-card",
  name: "Bold Quote Card",
  category: "Social Post",
  keywords: ["quote", "testimonial", "review", "review card", "client love", "square", "instagram"],
  defaultHue: 265,
  width: 1080,
  height: 1080,
  primaryField: "quote",
  fields: [
    { key: "quote", label: "Quote", default: "“Small business, big heart.” — a happy customer" },
    { key: "authorName", label: "Author name", default: "Jordan Blake" },
    { key: "authorTitle", label: "Author title", default: "Longtime customer" },
    { key: "brandTag", label: "Brand sign-off", default: "BRIGHTLEAF STUDIO" },
  ],
  Component: BoldQuoteCardGraphic,
};
