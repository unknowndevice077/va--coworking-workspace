import { EditableText } from "@/components/graphic/EditableText";
import { paletteFromHue } from "../palette";
import { HeaderBar, FooterBar, Chip, fonts } from "../parts";
import type { GraphicProps, GraphicTemplateDef } from "../types";

function MapIllustration({ palette }: { palette: ReturnType<typeof paletteFromHue> }) {
  return (
    <div style={{ marginTop: 22, background: palette.tint, borderRadius: 14, padding: "18px 24px", position: "relative", overflow: "hidden" }}>
      <svg viewBox="0 0 900 150" width="100%" height="150" style={{ display: "block" }}>
        <g stroke={palette.deep} strokeWidth="1.4" fill="none">
          <circle cx="250" cy="75" r="42" strokeDasharray="3 4" opacity="0.6" />
          <circle cx="250" cy="75" r="90" strokeDasharray="3 4" opacity="0.35" />
          <line x1="250" y1="75" x2="620" y2="75" strokeDasharray="4 5" />
        </g>
        <g transform="translate(230,55)">
          <rect x="0" y="14" width="40" height="26" fill={palette.deep} rx="2" />
          <polygon points="-4,14 20,-6 44,14" fill={palette.deep} />
        </g>
        <text x="250" y="118" textAnchor="middle" fontFamily="Inter" fontSize="12" fill={palette.mid} fontWeight="600">FIRE STATION</text>
        <g transform="translate(600,52)">
          <rect x="0" y="16" width="42" height="28" fill={palette.mid} rx="2" />
          <polygon points="-4,16 21,-4 46,16" fill={palette.mid} />
          <rect x="16" y="26" width="10" height="18" fill={palette.tint} />
        </g>
        <text x="620" y="118" textAnchor="middle" fontFamily="Inter" fontSize="12" fill={palette.mid} fontWeight="600">HOME</text>
        <text x="430" y="66" textAnchor="middle" fontFamily="Inter" fontSize="12" fill={palette.deep} fontWeight="600">5 MILES</text>
      </svg>
    </div>
  );
}

function LocalTipPubmatGraphic({ values: v, hue, editable, onEdit }: GraphicProps) {
  const p = paletteFromHue(hue);
  const edit = (key: string) => (val: string) => onEdit?.(key, val);

  return (
    <div style={{ width: "100%", height: "100%", background: "#fff", color: p.deep, display: "flex", flexDirection: "column", fontFamily: fonts.body, overflow: "hidden" }}>
      <HeaderBar palette={p} icon="pin" brand={v.brand} tag={v.tag} editable={editable} onEdit={(k, val) => onEdit?.(k, val)} />

      <div style={{ flex: 1, padding: "40px 56px 0" }}>
        <EditableText
          as="h1"
          value={v.headline}
          editable={editable}
          onEdit={edit("headline")}
          style={{ fontFamily: fonts.display, fontWeight: 600, fontSize: 33, lineHeight: 1.18, letterSpacing: "-0.01em", margin: 0, maxWidth: 900 }}
        />
        <EditableText
          as="p"
          value={v.subhead}
          editable={editable}
          onEdit={edit("subhead")}
          style={{ fontSize: 15.5, lineHeight: 1.5, color: p.ink, maxWidth: 640, margin: "10px 0 0" }}
        />

        <MapIllustration palette={p} />

        <div style={{ marginTop: 22, display: "flex", gap: 16 }}>
          <Chip palette={p} icon="pin" text={v.factor1} editable={editable} onEdit={edit("factor1")} />
          <Chip palette={p} icon="shield" text={v.factor2} editable={editable} onEdit={edit("factor2")} />
          <Chip palette={p} icon="drop" text={v.factor3} editable={editable} onEdit={edit("factor3")} />
        </div>

        <div style={{ marginTop: 22, display: "flex", gap: 16, alignItems: "stretch" }}>
          <div style={{ width: 270, flexShrink: 0, background: p.deep, borderRadius: 14, padding: "20px 22px", color: "#fff", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <EditableText value={v.statNum} editable={editable} onEdit={edit("statNum")} style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 44, lineHeight: 1 }} />
            <EditableText as="div" value={v.statSub} editable={editable} onEdit={edit("statSub")} style={{ marginTop: 8, fontSize: 13, lineHeight: 1.4, color: "rgba(255,255,255,0.85)" }} />
          </div>
          <div style={{ flex: 1, background: p.tint2, border: `1.5px solid ${p.mid}`, borderRadius: 14, padding: "20px 22px", display: "flex", alignItems: "center" }}>
            <EditableText value={v.cta} editable={editable} onEdit={edit("cta")} style={{ fontFamily: fonts.display, fontWeight: 600, fontSize: 18, lineHeight: 1.3, color: p.deep }} />
          </div>
        </div>
      </div>

      <FooterBar
        palette={p}
        line1={v.footerName}
        line2={v.footerSub}
        right={v.footerHandle}
        editable={editable}
        onEdit={(k, val) => onEdit?.(k, val)}
        keys={{ line1: "footerName", line2: "footerSub", right: "footerHandle" }}
      />
    </div>
  );
}

export const localTipPubmat: GraphicTemplateDef = {
  id: "local-tip-pubmat",
  name: "Local Tip Pubmat",
  category: "Social Post",
  keywords: ["tip", "insurance", "real estate", "local", "pubmat", "educational", "square", "instagram"],
  defaultHue: 150,
  width: 1080,
  height: 1080,
  primaryField: "headline",
  fields: [
    { key: "brand", label: "Brand / page name", default: "Canton Insurance Tip" },
    { key: "tag", label: "Corner tag", default: "Daily Tip · Canton, SD" },
    { key: "headline", label: "Headline", default: "Homeowners insurance quotes can vary by hundreds, depending on fire district and distance." },
    { key: "subhead", label: "Subhead", default: "Why two similar homes can have drastically different insurance premiums." },
    { key: "factor1", label: "Factor 1", default: "Distance to the nearest fire station" },
    { key: "factor2", label: "Factor 2", default: "Fire district rating (city vs. rural volunteer)" },
    { key: "factor3", label: "Factor 3", default: "Water source availability (hydrant vs. tanker response)" },
    { key: "statNum", label: "Stat number", default: "$300" },
    { key: "statSub", label: "Stat caption", default: "less per year to insure in city limits — same purchase price" },
    { key: "cta", label: "Call to action", default: "Get an insurance quote before you make an offer, not after." },
    { key: "footerName", label: "Footer name", default: "[Agent Name]" },
    { key: "footerSub", label: "Footer sub", default: "[Brokerage] · [Phone]" },
    { key: "footerHandle", label: "Footer handle", default: "@[Instagram handle]" },
  ],
  Component: LocalTipPubmatGraphic,
};
