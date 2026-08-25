import { EditableText } from "@/components/graphic/EditableText";
import { paletteFromHue } from "../palette";
import { fonts } from "../parts";
import type { GraphicProps, GraphicTemplateDef } from "../types";

function TitleSlideGraphic({ values: v, hue, editable, onEdit }: GraphicProps) {
  const p = paletteFromHue(hue);
  const edit = (key: string) => (val: string) => onEdit?.(key, val);

  return (
    <div style={{ width: "100%", height: "100%", background: p.deep, color: "#fff", display: "flex", flexDirection: "column", justifyContent: "center", fontFamily: fonts.body, padding: "0 140px", position: "relative", overflow: "hidden" }}>
      <svg width="620" height="620" viewBox="0 0 620 620" style={{ position: "absolute", right: -140, top: "50%", transform: "translateY(-50%)", opacity: 0.5 }}>
        <circle cx="310" cy="310" r="300" fill="none" stroke={p.mid} strokeWidth="1.5" opacity="0.5" />
        <circle cx="310" cy="310" r="220" fill="none" stroke={p.mid} strokeWidth="1.5" opacity="0.35" />
        <circle cx="310" cy="310" r="140" fill={p.mid} opacity="0.25" />
      </svg>

      <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: p.tint2 }}>
        <EditableText value={v.kicker} editable={editable} onEdit={edit("kicker")} />
      </span>

      <EditableText
        as="h1"
        value={v.title}
        editable={editable}
        onEdit={edit("title")}
        style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 68, lineHeight: 1.1, letterSpacing: "-0.01em", margin: "20px 0 0", maxWidth: 1050 }}
      />
      <EditableText
        as="p"
        value={v.subtitle}
        editable={editable}
        onEdit={edit("subtitle")}
        style={{ fontSize: 22, lineHeight: 1.5, color: "rgba(255,255,255,0.78)", maxWidth: 780, margin: "22px 0 0" }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 56 }}>
        <div style={{ width: 44, height: 2, background: p.mid }} />
        <EditableText value={v.presenter} editable={editable} onEdit={edit("presenter")} style={{ fontWeight: 700, fontSize: 16 }} />
        <span style={{ color: "rgba(255,255,255,0.4)" }}>·</span>
        <EditableText value={v.date} editable={editable} onEdit={edit("date")} style={{ fontSize: 15, color: "rgba(255,255,255,0.7)" }} />
      </div>
    </div>
  );
}

export const titleSlide: GraphicTemplateDef = {
  id: "title-slide",
  name: "Title Slide",
  category: "Presentation",
  keywords: ["presentation", "slide", "deck", "title", "pitch", "keynote"],
  defaultHue: 235,
  width: 1920,
  height: 1080,
  primaryField: "title",
  fields: [
    { key: "kicker", label: "Kicker", default: "Q4 Strategy Review" },
    { key: "title", label: "Title", default: "Where we're taking the brand next" },
    { key: "subtitle", label: "Subtitle", default: "A look at what worked, what didn't, and the plan for next quarter." },
    { key: "presenter", label: "Presenter", default: "Jamie Rios" },
    { key: "date", label: "Date", default: "September 2026" },
  ],
  Component: TitleSlideGraphic,
};
