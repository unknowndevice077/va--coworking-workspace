import { EditableText } from "@/components/graphic/EditableText";
import { paletteFromHue } from "../palette";
import { fonts } from "../parts";
import type { GraphicProps, GraphicTemplateDef } from "../types";

function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function LogoMonogramGraphic({ values: v, hue, editable, onEdit }: GraphicProps) {
  const p = paletteFromHue(hue);
  const edit = (key: string) => (val: string) => onEdit?.(key, val);
  const initials = initialsOf(v.brandName) || "?";

  return (
    <div style={{ width: "100%", height: "100%", background: p.tint, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26, fontFamily: fonts.body }}>
      <div
        style={{
          width: 210,
          height: 210,
          borderRadius: "50%",
          border: `3px solid ${p.deep}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff",
        }}
      >
        <span style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 84, letterSpacing: "-0.02em", color: p.deep }}>{initials}</span>
      </div>

      <div style={{ textAlign: "center" }}>
        <EditableText
          value={v.brandName}
          editable={editable}
          onEdit={edit("brandName")}
          style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 38, letterSpacing: "0.02em", color: p.deep, display: "block" }}
        />
        <div style={{ width: 44, height: 2, background: p.mid, margin: "12px auto" }} />
        <EditableText
          value={v.tagline}
          editable={editable}
          onEdit={edit("tagline")}
          style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: p.mid, display: "block" }}
        />
      </div>
    </div>
  );
}

export const logoMonogram: GraphicTemplateDef = {
  id: "logo-monogram",
  name: "Monogram Badge",
  category: "Logo",
  keywords: ["logo", "monogram", "initials", "letter", "law", "firm", "professional", "badge"],
  defaultHue: 255,
  width: 1080,
  height: 1080,
  primaryField: "brandName",
  fields: [
    { key: "brandName", label: "Brand name", default: "M & F Law" },
    { key: "tagline", label: "Tagline", default: "Family & Estate Counsel" },
  ],
  Component: LogoMonogramGraphic,
};
