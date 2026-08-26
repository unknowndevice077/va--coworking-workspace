"use client";

import { useRef } from "react";
import { ElementContent } from "@/lib/canvas-doc/render";
import type { DesignElement } from "@/lib/canvas-doc/types";

const MIN_SIZE = 16;

type Corner = "nw" | "ne" | "sw" | "se";

/**
 * One element on the canvas: draggable by its body, resizable by its four
 * corner handles when selected, and — for text — double-click to edit
 * in place. All drag/resize math happens in DESIGN pixels; `scale` converts
 * from the screen-pixel mouse deltas the browser actually gives us.
 */
export function ElementLayer({
  el,
  scale,
  selected,
  editing,
  onSelect,
  onStartEditing,
  onStopEditing,
  onChange,
  onCommitText,
}: {
  el: DesignElement;
  scale: number;
  selected: boolean;
  editing: boolean;
  onSelect: () => void;
  onStartEditing: () => void;
  onStopEditing: () => void;
  onChange: (patch: Partial<DesignElement>) => void;
  onCommitText: (text: string) => void;
}) {
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const resizeRef = useRef<{ corner: Corner; startX: number; startY: number; orig: { x: number; y: number; w: number; h: number } } | null>(null);

  function handleBodyPointerDown(e: React.PointerEvent) {
    if (editing) return; // let clicks/selection inside the editable text through
    e.stopPropagation();
    onSelect();
    if (e.button !== 0) return;
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: el.x, origY: el.y };
    const move = (ev: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = (ev.clientX - d.startX) / scale;
      const dy = (ev.clientY - d.startY) / scale;
      onChange({ x: Math.round(d.origX + dx), y: Math.round(d.origY + dy) });
    };
    const up = () => {
      dragRef.current = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  function handleResizePointerDown(e: React.PointerEvent, corner: Corner) {
    e.stopPropagation();
    e.preventDefault();
    resizeRef.current = { corner, startX: e.clientX, startY: e.clientY, orig: { x: el.x, y: el.y, w: el.w, h: el.h } };
    const move = (ev: PointerEvent) => {
      const r = resizeRef.current;
      if (!r) return;
      const dx = (ev.clientX - r.startX) / scale;
      const dy = (ev.clientY - r.startY) / scale;
      let { x, y, w, h } = r.orig;
      if (r.corner === "se") {
        w = Math.max(MIN_SIZE, r.orig.w + dx);
        h = Math.max(MIN_SIZE, r.orig.h + dy);
      } else if (r.corner === "sw") {
        w = Math.max(MIN_SIZE, r.orig.w - dx);
        h = Math.max(MIN_SIZE, r.orig.h + dy);
        x = r.orig.x + r.orig.w - w;
      } else if (r.corner === "ne") {
        w = Math.max(MIN_SIZE, r.orig.w + dx);
        h = Math.max(MIN_SIZE, r.orig.h - dy);
        y = r.orig.y + r.orig.h - h;
      } else {
        w = Math.max(MIN_SIZE, r.orig.w - dx);
        h = Math.max(MIN_SIZE, r.orig.h - dy);
        x = r.orig.x + r.orig.w - w;
        y = r.orig.y + r.orig.h - h;
      }
      onChange({ x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) });
    };
    const up = () => {
      resizeRef.current = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  const handleStyle = (corner: Corner): React.CSSProperties => {
    const size = Math.max(10, 10 / scale);
    return {
      position: "absolute",
      width: size,
      height: size,
      background: "#fff",
      border: "1.5px solid var(--accent, #2a496f)",
      borderRadius: 3,
      top: corner.includes("n") ? -size / 2 : undefined,
      bottom: corner.includes("s") ? -size / 2 : undefined,
      left: corner.includes("w") ? -size / 2 : undefined,
      right: corner.includes("e") ? -size / 2 : undefined,
      cursor: corner === "nw" || corner === "se" ? "nwse-resize" : "nesw-resize",
    };
  };

  return (
    <div
      style={{
        position: "absolute",
        left: el.x,
        top: el.y,
        width: el.w,
        height: el.h,
        transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
        outline: selected ? `${Math.max(1, 1.5 / scale)}px solid #2a496f` : "none",
        cursor: editing ? "text" : "move",
      }}
      onPointerDown={handleBodyPointerDown}
      onDoubleClick={() => el.type === "text" && onStartEditing()}
    >
      {editing && el.type === "text" ? (
        <div
          contentEditable
          suppressContentEditableWarning
          ref={(node) => {
            if (!node) return;
            // Explicit focus + select-all beats the HTML autofocus attribute
            // here: autofocus on a non-form contenteditable div isn't
            // reliably honored the instant React inserts it, so the first
            // keystroke could land nowhere. Selecting all existing text
            // also means typing immediately replaces it, like any real
            // design tool's text box.
            node.focus();
            const range = document.createRange();
            range.selectNodeContents(node);
            const sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(range);
          }}
          style={{
            width: "100%",
            height: "100%",
            fontFamily: el.fontFamily === "display" ? "'Space Grotesk', system-ui, sans-serif" : "'Inter', system-ui, sans-serif",
            fontSize: el.fontSize,
            fontWeight: el.fontWeight,
            color: el.color,
            textAlign: el.align,
            lineHeight: el.lineHeight,
            outline: "none",
            overflow: "hidden",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
          onBlur={(e) => {
            onCommitText(e.currentTarget.textContent ?? "");
            onStopEditing();
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {el.text}
        </div>
      ) : (
        <ElementContent el={el} />
      )}

      {selected && !editing && (
        <>
          <div style={handleStyle("nw")} onPointerDown={(e) => handleResizePointerDown(e, "nw")} />
          <div style={handleStyle("ne")} onPointerDown={(e) => handleResizePointerDown(e, "ne")} />
          <div style={handleStyle("sw")} onPointerDown={(e) => handleResizePointerDown(e, "sw")} />
          <div style={handleStyle("se")} onPointerDown={(e) => handleResizePointerDown(e, "se")} />
        </>
      )}
    </div>
  );
}
