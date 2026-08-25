import type { DesignTemplate } from "@/lib/design-templates";

type Variant = "grid" | "hero" | "mini";

const SIZES: Record<Variant, { pad: number; headline: number; sub: number; tag: number; icon: number }> = {
  grid: { pad: 12, headline: 13, sub: 9.5, tag: 8, icon: 22 },
  hero: { pad: 24, headline: 22, sub: 13, tag: 11, icon: 34 },
  mini: { pad: 0, headline: 0, sub: 0, tag: 0, icon: 26 },
};

/** Clamp text to N lines so a longer-than-expected headline never overflows its box. */
function clamp(lines: number): React.CSSProperties {
  return {
    display: "-webkit-box",
    WebkitLineClamp: lines,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  };
}

function Icon({ d, size, stroke }: { d: string; size: number; stroke: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={stroke}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

/**
 * A category-aware preview of a real template — a light mockup layout with
 * the template's sample copy, not just an abstract icon. Deliberately not a
 * photo or AI-generated image: this is a template match, and the preview
 * should read as "a real design you can send," not a placeholder glyph.
 */
export function TemplateThumb({ template, variant }: { template: DesignTemplate; variant: Variant }) {
  const s = SIZES[variant];
  const h = template.hue;

  if (variant === "mini") {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: `oklch(0.93 0.05 ${h})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon d={template.iconPath} size={s.icon} stroke={`oklch(0.48 0.15 ${h})`} />
      </div>
    );
  }

  const base: React.CSSProperties = {
    width: "100%",
    height: "100%",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Public Sans', system-ui, sans-serif",
  };

  if (template.category === "Logo") {
    return (
      <div
        style={{
          ...base,
          background: `oklch(0.95 0.025 ${h})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: variant === "hero" ? 14 : 8,
        }}
      >
        <div
          style={{
            width: s.icon + 20,
            height: s.icon + 20,
            borderRadius: "50%",
            border: `1.5px solid oklch(0.55 0.14 ${h})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fff",
          }}
        >
          <Icon d={template.iconPath} size={s.icon} stroke={`oklch(0.42 0.15 ${h})`} />
        </div>
        <div
          style={{
            fontSize: s.headline * 0.62,
            fontWeight: 700,
            letterSpacing: "0.14em",
            color: `oklch(0.38 0.1 ${h})`,
          }}
        >
          {template.headline}
        </div>
      </div>
    );
  }

  if (template.category === "Social Post") {
    return (
      <div
        style={{
          ...base,
          background: `oklch(0.5 0.15 ${h})`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: s.pad,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          {template.tag && (
            <span
              style={{
                fontSize: s.tag,
                fontWeight: 800,
                letterSpacing: "0.06em",
                color: `oklch(0.5 0.15 ${h})`,
                background: "#fff",
                padding: variant === "hero" ? "4px 10px" : "2px 7px",
                borderRadius: 99,
              }}
            >
              {template.tag}
            </span>
          )}
          <Icon d={template.iconPath} size={s.icon * 0.7} stroke="rgba(255,255,255,0.55)" />
        </div>
        <div>
          <div
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: s.headline,
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.15,
              ...clamp(2),
            }}
          >
            {template.headline}
          </div>
          {template.sub && (
            <div style={{ fontSize: s.sub, color: "rgba(255,255,255,0.85)", marginTop: 4, ...clamp(1) }}>
              {template.sub}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (template.category === "Flyer") {
    return (
      <div style={{ ...base, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            flex: 1,
            background: `oklch(0.55 0.14 ${h})`,
            padding: s.pad,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Icon d={template.iconPath} size={s.icon * 0.7} stroke="rgba(255,255,255,0.6)" />
          <div
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: s.headline,
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.15,
              marginTop: 6,
              ...clamp(2),
            }}
          >
            {template.headline}
          </div>
          {template.sub && (
            <div style={{ fontSize: s.sub, color: "rgba(255,255,255,0.85)", marginTop: 3, ...clamp(1) }}>
              {template.sub}
            </div>
          )}
        </div>
        {template.tag && (
          <div
            style={{
              background: `oklch(0.36 0.13 ${h})`,
              color: "#fff",
              fontSize: s.tag,
              fontWeight: 800,
              letterSpacing: "0.05em",
              padding: variant === "hero" ? "8px 16px" : "5px 10px",
              textAlign: "center",
              ...clamp(1),
            }}
          >
            {template.tag}
          </div>
        )}
      </div>
    );
  }

  if (template.category === "Business Card") {
    return (
      <div style={{ ...base, display: "flex" }}>
        <div
          style={{
            width: variant === "hero" ? 84 : 46,
            flexShrink: 0,
            background: `oklch(0.48 0.13 ${h})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon d={template.iconPath} size={s.icon * 0.6} stroke="#fff" />
        </div>
        <div
          style={{
            flex: 1,
            background: "#fdfdfc",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: s.pad,
            gap: 3,
          }}
        >
          <div style={{ fontSize: s.headline * 0.85, fontWeight: 700, color: "#1c1b19", ...clamp(1) }}>
            {template.headline}
          </div>
          {template.sub && (
            <div style={{ fontSize: s.sub, color: `oklch(0.48 0.13 ${h})`, fontWeight: 600, ...clamp(1) }}>
              {template.sub}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Presentation
  return (
    <div
      style={{
        ...base,
        background: `oklch(0.26 0.05 ${h})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: s.pad,
        gap: 8,
      }}
    >
      <Icon d={template.iconPath} size={s.icon * 0.6} stroke={`oklch(0.75 0.1 ${h})`} />
      <div
        style={{
          ...clamp(2),
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontSize: s.headline,
          fontWeight: 700,
          color: "#fff",
        }}
      >
        {template.headline}
      </div>
      <div style={{ width: 28, height: 1.5, background: `oklch(0.7 0.12 ${h})` }} />
      {template.sub && <div style={{ fontSize: s.sub, color: "rgba(255,255,255,0.75)" }}>{template.sub}</div>}
    </div>
  );
}
