"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap";

function prepareDoc(d: Document) {
  if (!d.getElementById("export-reset")) {
    const style = d.createElement("style");
    style.id = "export-reset";
    // The templates assume border-box sizing (same as the app's own global
    // reset) — without this, every padded box overflows past its declared
    // width/height in this bare iframe and gets clipped out of the capture.
    style.textContent = "*{box-sizing:border-box;margin:0;padding:0;}";
    d.head.appendChild(style);
  }
  if (!d.getElementById("export-fonts")) {
    const link = d.createElement("link");
    link.id = "export-fonts";
    link.rel = "stylesheet";
    link.href = FONTS_HREF;
    d.head.appendChild(link);
  }
}

/**
 * A hidden, full-resolution render target for PNG export via html2canvas.
 *
 * html2canvas ships its own CSS color parser that doesn't understand
 * oklch()/lab() — and the browser serializes this app's oklch design
 * tokens (--bg, --accent, --sidebar, ...) as lab() in computed style, which
 * crashes html2canvas the moment it touches ANY element on the page that
 * inherits them (which, via a full-document clone, is effectively all of
 * them). Rendering the template inside a blank iframe — a separate
 * document with none of the app's CSS — sidesteps the whole problem: every
 * computed value in there is either a plain color we set explicitly or a
 * browser default, never oklch/lab.
 */
export function ExportCanvas({
  width,
  height,
  children,
  onReady,
}: {
  width: number;
  height: number;
  children: React.ReactNode;
  onReady?: (node: HTMLDivElement, doc: Document) => void;
}) {
  const [doc, setDoc] = useState<Document | null>(null);

  return (
    <iframe
      title="export-canvas"
      aria-hidden="true"
      tabIndex={-1}
      style={{ position: "fixed", top: 0, left: -100000, width, height, border: "none", pointerEvents: "none" }}
      onLoad={(e) => {
        const d = e.currentTarget.contentDocument;
        if (!d) return;
        prepareDoc(d);
        setDoc(d);
      }}
      ref={(el) => {
        // A blank iframe's document is usually ready before React even
        // attaches onLoad (no network request needed) — catch that case too.
        const d = el?.contentDocument;
        if (d && d.readyState === "complete" && !doc) {
          prepareDoc(d);
          setDoc(d);
        }
      }}
    >
      {doc &&
        createPortal(
          <div
            ref={(node) => {
              if (node) onReady?.(node, doc);
            }}
            style={{ width, height, overflow: "hidden" }}
          >
            {children}
          </div>,
          doc.body
        )}
    </iframe>
  );
}
