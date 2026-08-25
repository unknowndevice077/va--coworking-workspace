import { EditableText } from "@/components/graphic/EditableText";
import { paletteFromHue } from "../palette";
import { fonts } from "../parts";
import type { GraphicProps, GraphicTemplateDef } from "../types";

function Mark({ palette, size }: { palette: ReturnType<typeof paletteFromHue>; size: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: palette.deep,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
        <path d="M12 3l7.5 4.5v9L12 21l-7.5-4.5v-9Z" stroke={palette.tint} strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M12 3v18 M4.5 7.5l15 9 M19.5 7.5l-15 9" stroke={palette.mid} strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function LogoLockupGraphic({ values: v, hue, editable, onEdit }: GraphicProps) {
  const p = paletteFromHue(hue);
  const edit = (key: string) => (val: string) => onEdit?.(key, val);

  return (
    <div style={{ width: "100%", height: "100%", background: "#fff", display: "flex", flexDirection: "column", fontFamily: fonts.body }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
        <Mark palette={p} size={140} />
        <EditableText
          value={v.brandName}
          editable={editable}
          onEdit={edit("brandName")}
          style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 44, letterSpacing: "-0.01em", color: p.deep }}
        />
        <EditableText
          value={v.tagline}
          editable={editable}
          onEdit={edit("tagline")}
          style={{ fontSize: 15, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: p.mid }}
        />
      </div>

      <div style={{ display: "flex", gap: 1, background: p.tint2 }}>
        <div style={{ flex: 1, background: p.deep, padding: "26px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <Mark palette={{ ...p, deep: "rgba(255,255,255,0.14)", tint: "#fff", mid: p.tint2 }} size={34} />
          <span style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 18, color: "#fff" }}>{v.brandName}</span>
        </div>
        <div style={{ flex: 1, background: "#fff", padding: "26px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <Mark palette={p} size={34} />
          <span style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 18, color: p.deep }}>{v.brandName}</span>
        </div>
      </div>
    </div>
  );
}

export const logoLockup: GraphicTemplateDef = {
  id: "logo-lockup",
  name: "Icon Lockup",
  category: "Logo",
  keywords: ["logo", "brand", "mark", "lockup", "icon", "startup", "modern"],
  defaultHue: 210,
  width: 1080,
  height: 1080,
  primaryField: "brandName",
  fields: [
    { key: "brandName", label: "Brand name", default: "Hexagon Co." },
    { key: "tagline", label: "Tagline", default: "Design & Strategy" },
  ],
  Component: LogoLockupGraphic,
};
