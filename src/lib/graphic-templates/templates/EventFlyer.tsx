import { EditableText } from "@/components/graphic/EditableText";
import { paletteFromHue } from "../palette";
import { HeaderBar, fonts } from "../parts";
import { GIcon } from "../icons";
import type { GraphicProps, GraphicTemplateDef } from "../types";

function DetailRow({
  icon,
  value,
  editable,
  onEdit,
  palette,
}: {
  icon: "clock" | "pin";
  value: string;
  editable: boolean;
  onEdit: (v: string) => void;
  palette: ReturnType<typeof paletteFromHue>;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderTop: `1px solid ${palette.tint2}` }}>
      <div style={{ width: 34, height: 34, borderRadius: "50%", background: palette.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <GIcon name={icon} size={17} stroke={palette.deep} />
      </div>
      <EditableText value={value} editable={editable} onEdit={onEdit} style={{ fontSize: 16, fontWeight: 500, color: palette.deep }} />
    </div>
  );
}

function EventFlyerGraphic({ values: v, hue, editable, onEdit }: GraphicProps) {
  const p = paletteFromHue(hue);
  const edit = (key: string) => (val: string) => onEdit?.(key, val);

  return (
    <div style={{ width: "100%", height: "100%", background: "#fff", color: p.deep, display: "flex", flexDirection: "column", fontFamily: fonts.body, overflow: "hidden" }}>
      <HeaderBar palette={p} icon="sparkle" brand={v.brand} editable={editable} onEdit={(k, val) => onEdit?.(k, val)} pad={30} />

      <div style={{ flex: 1, padding: "48px 60px 0", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          <div style={{ width: 108, flexShrink: 0, background: p.deep, borderRadius: 16, padding: "18px 0", textAlign: "center", color: "#fff" }}>
            <EditableText value={v.dateDay} editable={editable} onEdit={edit("dateDay")} style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 46, lineHeight: 1, display: "block" }} />
            <EditableText value={v.dateMonth} editable={editable} onEdit={edit("dateMonth")} style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.08em", marginTop: 6, display: "block" }} />
          </div>
          <EditableText
            as="h1"
            value={v.eventTitle}
            editable={editable}
            onEdit={edit("eventTitle")}
            style={{ fontFamily: fonts.display, fontWeight: 600, fontSize: 40, lineHeight: 1.15, letterSpacing: "-0.01em", margin: 0, paddingTop: 6, maxWidth: 700, minWidth: 0, flex: 1 }}
          />
        </div>

        <div style={{ marginTop: 40 }}>
          <DetailRow icon="clock" value={v.timeText} editable={editable} onEdit={edit("timeText")} palette={p} />
          <DetailRow icon="pin" value={v.venueText} editable={editable} onEdit={edit("venueText")} palette={p} />
        </div>

        <div style={{ flex: 1, marginTop: 32, background: p.tint, borderRadius: 16, position: "relative", overflow: "hidden" }}>
          <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
            <circle cx="330" cy="40" r="140" fill={p.tint2} opacity="0.7" />
            <circle cx="40" cy="280" r="110" fill={p.tint2} opacity="0.5" />
          </svg>
        </div>
      </div>

      <div style={{ background: p.mid, color: "#fff", padding: "26px 60px", textAlign: "center" }}>
        <EditableText value={v.ctaText} editable={editable} onEdit={edit("ctaText")} style={{ fontFamily: fonts.display, fontWeight: 600, fontSize: 20 }} />
      </div>
    </div>
  );
}

export const eventFlyer: GraphicTemplateDef = {
  id: "event-flyer",
  name: "Event Flyer",
  category: "Flyer",
  keywords: ["event", "flyer", "poster", "open house", "workshop", "launch party", "rsvp", "date"],
  defaultHue: 25,
  width: 1080,
  height: 1350,
  primaryField: "eventTitle",
  fields: [
    { key: "brand", label: "Brand / host", default: "Brightleaf Studio" },
    { key: "eventTitle", label: "Event title", default: "Fall Open House" },
    { key: "dateDay", label: "Date (day)", default: "14" },
    { key: "dateMonth", label: "Date (month)", default: "SAT · SEP" },
    { key: "timeText", label: "Time", default: "1:00 – 4:00 PM" },
    { key: "venueText", label: "Venue", default: "412 Maple Ave, Canton" },
    { key: "ctaText", label: "Call to action", default: "RSVP at brightleafstudio.com/openhouse" },
  ],
  Component: EventFlyerGraphic,
};
