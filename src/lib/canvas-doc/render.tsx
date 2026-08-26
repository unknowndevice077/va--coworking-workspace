import type { CanvasDoc, DesignElement } from "./types";
import { GIcon } from "./icons";

const fontStacks = {
  display: "'Space Grotesk', 'Public Sans', system-ui, sans-serif",
  body: "'Inter', 'Public Sans', system-ui, sans-serif",
};

/** The visual content of one element, sized to fill its (already-positioned) container. */
export function ElementContent({ el }: { el: DesignElement }) {
  switch (el.type) {
    case "text":
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            fontFamily: fontStacks[el.fontFamily],
            fontSize: el.fontSize,
            fontWeight: el.fontWeight,
            color: el.color,
            textAlign: el.align,
            lineHeight: el.lineHeight,
            overflow: "hidden",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {el.text}
        </div>
      );
    case "shape":
      if (el.shape === "line") {
        return (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              opacity: el.opacity,
            }}
          >
            <div style={{ width: "100%", height: Math.max(1, el.strokeWidth ?? 2), background: el.fill }} />
          </div>
        );
      }
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: el.fill,
            borderRadius: el.shape === "ellipse" ? "50%" : el.radius,
            opacity: el.opacity,
            border: el.stroke ? `${el.strokeWidth ?? 1.5}px solid ${el.stroke}` : undefined,
            boxSizing: "border-box",
          }}
        />
      );
    case "icon":
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: el.background,
            borderRadius: el.background ? Math.min(el.w, el.h) * 0.22 : 0,
          }}
        >
          <GIcon name={el.icon} size={Math.min(el.w, el.h) * 0.62} stroke={el.color} />
        </div>
      );
    case "image":
      return (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary user-uploaded data: URIs, not a static asset
        <img
          src={el.src}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: el.radius, display: "block" }}
        />
      );
  }
}

/** A fully static render of a whole doc — thumbnails, the client portal, and PNG export. */
export function DocSurface({ doc }: { doc: CanvasDoc }) {
  const sorted = [...doc.elements].sort((a, b) => a.zIndex - b.zIndex);
  return (
    <div style={{ width: doc.width, height: doc.height, background: doc.background, position: "relative", overflow: "hidden" }}>
      {sorted.map((el) => (
        <div
          key={el.id}
          style={{
            position: "absolute",
            left: el.x,
            top: el.y,
            width: el.w,
            height: el.h,
            transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
          }}
        >
          <ElementContent el={el} />
        </div>
      ))}
    </div>
  );
}
