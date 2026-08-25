import { EditableText } from "@/components/graphic/EditableText";
import { GIcon, type GIconName } from "./icons";
import type { Palette } from "./palette";

export const fonts = {
  display: "'Space Grotesk', 'Public Sans', system-ui, sans-serif",
  body: "'Inter', 'Public Sans', system-ui, sans-serif",
};

/** The deep-colored brand row used at the top of most templates. */
export function HeaderBar({
  palette,
  icon = "sparkle",
  brand,
  tag,
  editable,
  onEdit,
  pad = 26,
}: {
  palette: Palette;
  icon?: GIconName;
  brand: string;
  tag?: string;
  editable: boolean;
  onEdit?: (key: string, value: string) => void;
  pad?: number;
}) {
  return (
    <div
      style={{
        background: palette.deep,
        color: "#fff",
        padding: `${pad}px 56px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: fonts.display, fontWeight: 600, letterSpacing: "0.04em", fontSize: 19 }}>
        <GIcon name={icon} size={22} />
        <EditableText value={brand} editable={editable} onEdit={(v) => onEdit?.("brand", v)} />
      </div>
      {tag !== undefined && (
        <span
          style={{
            fontFamily: fonts.body,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.06em",
            background: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.35)",
            padding: "6px 15px",
            borderRadius: 20,
          }}
        >
          <EditableText value={tag} editable={editable} onEdit={(v) => onEdit?.("tag", v)} />
        </span>
      )}
    </div>
  );
}

/** The deep-colored sign-off bar used at the bottom of most templates. */
export function FooterBar({
  palette,
  line1,
  line2,
  right,
  editable,
  onEdit,
  keys = { line1: "footerLine1", line2: "footerLine2", right: "footerRight" },
}: {
  palette: Palette;
  line1: string;
  line2?: string;
  right?: string;
  editable: boolean;
  onEdit?: (key: string, value: string) => void;
  keys?: { line1: string; line2?: string; right?: string };
}) {
  return (
    <div
      style={{
        marginTop: "auto",
        background: palette.deep,
        color: "#fff",
        padding: "22px 56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: fonts.body,
        fontSize: 14,
      }}
    >
      <div>
        <EditableText
          as="div"
          value={line1}
          editable={editable}
          onEdit={(v) => onEdit?.(keys.line1, v)}
          style={{ fontFamily: fonts.display, fontWeight: 600, fontSize: 15.5 }}
        />
        {line2 !== undefined && keys.line2 && (
          <EditableText
            as="div"
            value={line2}
            editable={editable}
            onEdit={(v) => onEdit?.(keys.line2!, v)}
            style={{ color: "rgba(255,255,255,0.75)", marginTop: 2, fontSize: 13 }}
          />
        )}
      </div>
      {right !== undefined && keys.right && (
        <EditableText value={right} editable={editable} onEdit={(v) => onEdit?.(keys.right!, v)} />
      )}
    </div>
  );
}

/** An icon-in-circle + short line of text — the "factor" / feature-bullet unit. */
export function Chip({
  palette,
  icon,
  text,
  editable,
  onEdit,
}: {
  palette: Palette;
  icon: GIconName;
  text: string;
  editable: boolean;
  onEdit?: (value: string) => void;
}) {
  return (
    <div style={{ flex: 1, background: palette.tint, borderRadius: 12, padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ width: 38, height: 38, borderRadius: "50%", background: palette.deep, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <GIcon name={icon} size={19} stroke="#fff" />
      </div>
      <EditableText
        value={text}
        editable={editable}
        onEdit={onEdit}
        style={{ fontFamily: fonts.body, fontSize: 13.5, lineHeight: 1.4, color: palette.deep, fontWeight: 500 }}
      />
    </div>
  );
}
