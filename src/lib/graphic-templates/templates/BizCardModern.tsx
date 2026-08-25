import { EditableText } from "@/components/graphic/EditableText";
import { paletteFromHue } from "../palette";
import { fonts } from "../parts";
import { GIcon } from "../icons";
import type { GraphicProps, GraphicTemplateDef } from "../types";

function ContactRow({
  icon,
  value,
  editable,
  onEdit,
  palette,
}: {
  icon: "phone" | "mail" | "globe";
  value: string;
  editable: boolean;
  onEdit: (v: string) => void;
  palette: ReturnType<typeof paletteFromHue>;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <GIcon name={icon} size={15} stroke={palette.mid} />
      <EditableText value={value} editable={editable} onEdit={onEdit} style={{ fontSize: 14, color: "#3a3a36" }} />
    </div>
  );
}

function BizCardModernGraphic({ values: v, hue, editable, onEdit }: GraphicProps) {
  const p = paletteFromHue(hue);
  const edit = (key: string) => (val: string) => onEdit?.(key, val);

  return (
    <div style={{ width: "100%", height: "100%", background: "#fff", display: "flex", fontFamily: fonts.body, overflow: "hidden" }}>
      <div
        style={{
          width: "36%",
          flexShrink: 0,
          background: p.deep,
          color: "#fff",
          padding: "0 28px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 400 600" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, opacity: 0.5 }}>
          <circle cx="380" cy="40" r="150" fill={p.mid} opacity="0.35" />
          <circle cx="20" cy="580" r="120" fill={p.mid} opacity="0.3" />
        </svg>
        <div style={{ position: "relative" }}>
          <div style={{ width: 46, height: 46, borderRadius: 10, background: "rgba(255,255,255,0.14)", border: "1.5px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <GIcon name="briefcase" size={22} stroke="#fff" />
          </div>
          <EditableText value={v.company} editable={editable} onEdit={edit("company")} style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 20, lineHeight: 1.25 }} />
        </div>
      </div>

      <div style={{ flex: 1, padding: "0 42px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 18 }}>
        <div>
          <EditableText value={v.name} editable={editable} onEdit={edit("name")} style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 26, color: p.deep, display: "block" }} />
          <EditableText value={v.title} editable={editable} onEdit={edit("title")} style={{ fontSize: 14.5, fontWeight: 600, color: p.mid, marginTop: 4, display: "block" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          <ContactRow icon="phone" value={v.phone} editable={editable} onEdit={edit("phone")} palette={p} />
          <ContactRow icon="mail" value={v.email} editable={editable} onEdit={edit("email")} palette={p} />
          <ContactRow icon="globe" value={v.website} editable={editable} onEdit={edit("website")} palette={p} />
        </div>
      </div>
    </div>
  );
}

export const bizCardModern: GraphicTemplateDef = {
  id: "biz-card-modern",
  name: "Modern Business Card",
  category: "Business Card",
  keywords: ["business card", "card", "contact", "professional", "corporate"],
  defaultHue: 190,
  width: 1050,
  height: 600,
  primaryField: "name",
  fields: [
    { key: "company", label: "Company", default: "Node Labs" },
    { key: "name", label: "Name", default: "Avery Chen" },
    { key: "title", label: "Title", default: "Founder & Creative Director" },
    { key: "phone", label: "Phone", default: "(605) 555-0148" },
    { key: "email", label: "Email", default: "avery@nodelabs.co" },
    { key: "website", label: "Website", default: "nodelabs.co" },
  ],
  Component: BizCardModernGraphic,
};
