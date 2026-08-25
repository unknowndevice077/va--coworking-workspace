"use client";

import { useEffect, useRef, useState } from "react";

// Every graphic template renders at one fixed, real pixel size (its export
// resolution) and is scaled down to fit whatever box it's placed in — a
// grid thumbnail, a portal row, or the studio's big editor. Measured with
// ResizeObserver rather than CSS container-query units: those units don't
// reliably resolve for a container sized by a CSS Grid track (a real,
// observed Chromium quirk), and this needs to work inside the template
// browse grid. `forwardedRef`, when given, points at the true-size
// (unscaled) inner node — used for PNG export so the captured image is
// always native resolution, never a screenshot of a shrunk preview.
export function ScaledCanvas({
  width,
  height,
  children,
  className,
  forwardedRef,
}: {
  width: number;
  height: number;
  children: React.ReactNode;
  className?: string;
  forwardedRef?: React.Ref<HTMLDivElement>;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setScale(w / width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  return (
    <div
      ref={outerRef}
      className={className}
      style={{
        width: "100%",
        aspectRatio: `${width} / ${height}`,
        overflow: "hidden",
        position: "relative",
        background: "#fff",
      }}
    >
      <div
        style={{
          width,
          height,
          position: "absolute",
          top: 0,
          left: 0,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          visibility: scale ? "visible" : "hidden",
        }}
      >
        <div ref={forwardedRef} style={{ width, height }}>
          {children}
        </div>
      </div>
    </div>
  );
}
