"use client";

import { useEffect, useRef, useState, useActionState } from "react";
import Link from "next/link";
import { ElementLayer } from "./ElementLayer";
import { PropertiesPanel } from "./PropertiesPanel";
import { ExportCanvas } from "@/components/graphic/ExportCanvas";
import { DocSurface } from "@/lib/canvas-doc/render";
import { newElId } from "@/lib/canvas-doc/types";
import type { CanvasDoc, DesignElement, DistributiveOmit } from "@/lib/canvas-doc/types";
import { gIcons, type GIconName } from "@/lib/canvas-doc/icons";
import { updateDesignAction, deleteDesignAction } from "@/app/(app)/design-engine/actions";
import loginStyles from "@/app/login/login.module.css";
import styles from "./canvas-editor.module.css";

type DesignRow = { id: string; name: string; doc: CanvasDoc; status: string };
type Panel = "text" | "elements" | "uploads" | "background" | null;

const BG_SWATCHES = ["#ffffff", "#f4f3f0", "#131b26", "#1f4b36", "#5c1f2e", "#163a4d", "#0f2a44", "#eaf3ec"];
const ICON_CHOICES = Object.keys(gIcons) as GIconName[];

function nextZ(elements: DesignElement[]) {
  return elements.reduce((m, e) => Math.max(m, e.zIndex), 0) + 1;
}

// ---------- Small stroke icons for the left rail, matching the app's set ----------
function RailIconText() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 6h14M12 6v13" />
    </svg>
  );
}
function RailIconElements() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="10" width="9" height="9" rx="1.5" />
      <circle cx="16.5" cy="7.5" r="4.2" />
    </svg>
  );
}
function RailIconUploads() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15V4M8 8l4-4 4 4" />
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}
function RailIconBackground() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3s6.5 6.8 6.5 11.2A6.5 6.5 0 0 1 5.5 14.2C5.5 9.8 12 3 12 3Z" />
    </svg>
  );
}
function RailIconDownload() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v11M8 11l4 4 4-4" />
      <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

export function CanvasEditor({ design, sentCount }: { design: DesignRow; sentCount: number }) {
  const [name, setName] = useState(design.name);
  const [doc, setDoc] = useState<CanvasDoc>(design.doc);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [scale, setScale] = useState(0.001);
  const [downloading, setDownloading] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const wrapRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportNodeRef = useRef<HTMLDivElement | null>(null);
  const exportDocRef = useRef<Document | null>(null);

  const [saveState, saveAction, savePending] = useActionState(updateDesignAction, undefined);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setScale(w / doc.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [doc.width]);

  // Delete/Backspace removes the selected element — but never while typing
  // in a text field or editing an element's own text in place.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      if (editingId) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
      if (selectedId) {
        e.preventDefault();
        removeElement(selectedId);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId, editingId]);

  const selected = doc.elements.find((e) => e.id === selectedId);

  function updateElement(id: string, patch: Partial<DesignElement>) {
    setDoc((d) => ({ ...d, elements: d.elements.map((e) => (e.id === id ? ({ ...e, ...patch } as DesignElement) : e)) }));
  }

  function removeElement(id: string) {
    setDoc((d) => ({ ...d, elements: d.elements.filter((e) => e.id !== id) }));
    setSelectedId(null);
    setEditingId(null);
  }

  function duplicateElement(id: string) {
    setDoc((d) => {
      const el = d.elements.find((e) => e.id === id);
      if (!el) return d;
      const copy: DesignElement = { ...el, id: newElId(), x: el.x + 24, y: el.y + 24, zIndex: nextZ(d.elements) };
      setSelectedId(copy.id);
      return { ...d, elements: [...d.elements, copy] };
    });
  }

  function reorder(id: string, dir: 1 | -1) {
    setDoc((d) => {
      const sorted = [...d.elements].sort((a, b) => a.zIndex - b.zIndex);
      const idx = sorted.findIndex((e) => e.id === id);
      const swapIdx = idx + dir;
      if (idx < 0 || swapIdx < 0 || swapIdx >= sorted.length) return d;
      const a = sorted[idx];
      const b = sorted[swapIdx];
      const az = a.zIndex;
      a.zIndex = b.zIndex;
      b.zIndex = az;
      return { ...d, elements: [...d.elements] };
    });
  }

  function addElement(el: DistributiveOmit<DesignElement, "id" | "zIndex" | "rotation">) {
    const id = newElId();
    setDoc((d) => ({ ...d, elements: [...d.elements, { ...el, id, zIndex: nextZ(d.elements), rotation: 0 } as DesignElement] }));
    setSelectedId(id);
  }

  function addText(variant: "heading" | "subheading" | "body") {
    const presets = {
      heading: { fontSize: 44, fontWeight: 700 as const, fontFamily: "display" as const, text: "Add a heading" },
      subheading: { fontSize: 24, fontWeight: 600 as const, fontFamily: "display" as const, text: "Add a subheading" },
      body: { fontSize: 16, fontWeight: 400 as const, fontFamily: "body" as const, text: "Add a little bit of body text" },
    };
    const p = presets[variant];
    const w = Math.round(doc.width * (variant === "body" ? 0.55 : 0.6));
    addElement({
      type: "text",
      x: Math.round((doc.width - w) / 2),
      y: Math.round(doc.height / 2 - p.fontSize),
      w,
      h: Math.round(p.fontSize * 1.6),
      text: p.text,
      fontFamily: p.fontFamily,
      fontSize: p.fontSize,
      fontWeight: p.fontWeight,
      color: "#131b26",
      align: "left",
      lineHeight: 1.25,
    });
  }

  function addShape(shape: "rect" | "ellipse" | "line") {
    const w = shape === "line" ? 240 : 220;
    const h = shape === "line" ? 4 : 160;
    addElement({
      type: "shape",
      shape,
      x: Math.round((doc.width - w) / 2),
      y: Math.round((doc.height - h) / 2),
      w,
      h,
      fill: "#2a496f",
      radius: 10,
      opacity: 1,
    });
  }

  function addIcon(icon: GIconName) {
    addElement({
      type: "icon",
      x: Math.round(doc.width / 2 - 32),
      y: Math.round(doc.height / 2 - 32),
      w: 64,
      h: 64,
      icon,
      color: "#131b26",
    });
  }

  function addImage(src: string) {
    const w = Math.round(doc.width * 0.4);
    const h = Math.round(w * 0.7);
    addElement({
      type: "image",
      x: Math.round((doc.width - w) / 2),
      y: Math.round((doc.height - h) / 2),
      w,
      h,
      src,
      radius: 8,
    });
  }

  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      setUploadedImages((u) => [src, ...u]);
      addImage(src);
    };
    reader.readAsDataURL(file);
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      const node = exportNodeRef.current;
      const exportDoc = exportDocRef.current;
      if (!node || !exportDoc) {
        alert("Still getting the canvas ready — try again in a second.");
        return;
      }
      const { default: html2canvas } = await import("html2canvas");
      await exportDoc.fonts.ready;
      const canvas = await html2canvas(node, { useCORS: true, backgroundColor: doc.background, scale: 2 });
      const link = document.createElement("a");
      link.download = `${(name || "design").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error(err);
      alert("Download failed — please try again.");
    } finally {
      setDownloading(false);
    }
  }

  function togglePanel(p: Exclude<Panel, null>) {
    setPanel((cur) => (cur === p ? null : p));
  }

  const sortedElements = [...doc.elements].sort((a, b) => a.zIndex - b.zIndex);
  const docJson = JSON.stringify(doc);

  const statusLabel =
    design.status === "SENT"
      ? `Sent · ${sentCount} client${sentCount === 1 ? "" : "s"}`
      : "Draft · private to you";

  return (
    <div className={styles.studioShell}>
      {/* ---------- Top bar ---------- */}
      <div className={styles.topbar}>
        <Link href="/design-engine/studio" className={styles.homeBtn} aria-label="Back to My Designs">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 10.5 12 4l9 6.5" />
            <path d="M5 9.5V20a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1V9.5" />
          </svg>
        </Link>
        <div className={styles.topbarDivider} />
        <input
          className={styles.nameInput}
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Design name"
        />
        <span className={styles.statusText}>{statusLabel}</span>
        <div className={styles.topbarSpacer} />
        <button type="button" className={styles.topbarGhostBtn} disabled={downloading} onClick={handleDownload}>
          <RailIconDownload />
          {downloading ? "Rendering…" : "Download PNG"}
        </button>
        <form action={saveAction}>
          <input type="hidden" name="id" value={design.id} />
          <input type="hidden" name="name" value={name} />
          <input type="hidden" name="doc" value={docJson} />
          <button className={styles.topbarSaveBtn} type="submit" disabled={savePending}>
            {savePending ? "Saving…" : saveState?.saved ? "Saved ✓" : "Save"}
          </button>
        </form>
      </div>
      {saveState?.error && <div className={`${loginStyles.error} ${styles.saveError}`}>{saveState.error}</div>}

      {/* ---------- Workspace ---------- */}
      <div className={styles.workspace}>
        <div className={styles.rail}>
          <button type="button" className={`${styles.railBtn} ${panel === "text" ? styles.railBtnOn : ""}`} onClick={() => togglePanel("text")}>
            <span className={styles.railIcon}><RailIconText /></span>
            Text
          </button>
          <button type="button" className={`${styles.railBtn} ${panel === "elements" ? styles.railBtnOn : ""}`} onClick={() => togglePanel("elements")}>
            <span className={styles.railIcon}><RailIconElements /></span>
            Elements
          </button>
          <button type="button" className={`${styles.railBtn} ${panel === "uploads" ? styles.railBtnOn : ""}`} onClick={() => togglePanel("uploads")}>
            <span className={styles.railIcon}><RailIconUploads /></span>
            Uploads
          </button>
          <button type="button" className={`${styles.railBtn} ${panel === "background" ? styles.railBtnOn : ""}`} onClick={() => togglePanel("background")}>
            <span className={styles.railIcon}><RailIconBackground /></span>
            Background
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImagePick} />
        </div>

        {panel && (
          <div className={styles.flyout}>
            {panel === "text" && (
              <div>
                <div className={styles.flyoutTitle}>Add text</div>
                <button type="button" className={styles.textSample} style={{ fontSize: 22, fontWeight: 700 }} onClick={() => addText("heading")}>
                  Add a heading
                </button>
                <button type="button" className={styles.textSample} style={{ fontSize: 16, fontWeight: 600 }} onClick={() => addText("subheading")}>
                  Add a subheading
                </button>
                <button type="button" className={styles.textSample} style={{ fontSize: 13, fontWeight: 400 }} onClick={() => addText("body")}>
                  Add a little bit of body text
                </button>
              </div>
            )}

            {panel === "elements" && (
              <div>
                <div className={styles.flyoutTitle}>Shapes</div>
                <div className={styles.shapeRow}>
                  <button type="button" className={styles.shapeBtn} onClick={() => addShape("rect")} aria-label="Rectangle">
                    <span style={{ width: 26, height: 20, background: "var(--text)", borderRadius: 3 }} />
                  </button>
                  <button type="button" className={styles.shapeBtn} onClick={() => addShape("ellipse")} aria-label="Circle">
                    <span style={{ width: 22, height: 22, background: "var(--text)", borderRadius: "50%" }} />
                  </button>
                  <button type="button" className={styles.shapeBtn} onClick={() => addShape("line")} aria-label="Line">
                    <span style={{ width: 26, height: 3, background: "var(--text)" }} />
                  </button>
                </div>
                <div className={styles.flyoutTitle} style={{ marginTop: 18 }}>Icons</div>
                <div className={styles.iconGrid}>
                  {ICON_CHOICES.map((n) => (
                    <button key={n} type="button" className={styles.iconChoice} onClick={() => addIcon(n)} aria-label={`Add ${n} icon`}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                        <path d={gIcons[n]} />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {panel === "uploads" && (
              <div>
                <div className={styles.flyoutTitle}>Uploads</div>
                <button type="button" className={styles.uploadDropzone} onClick={() => fileInputRef.current?.click()}>
                  <RailIconUploads />
                  Upload an image
                </button>
                {uploadedImages.length > 0 && (
                  <div className={styles.uploadGrid}>
                    {uploadedImages.map((src, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={src} alt="" className={styles.uploadThumb} onClick={() => addImage(src)} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {panel === "background" && (
              <div>
                <div className={styles.flyoutTitle}>Canvas background</div>
                <div className={styles.swatchRow}>
                  {BG_SWATCHES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Background ${c}`}
                      className={`${styles.swatch} ${doc.background.toLowerCase() === c ? styles.swatchOn : ""}`}
                      style={{ background: c, border: c === "#ffffff" ? "1px solid var(--border)" : undefined }}
                      onClick={() => setDoc((d) => ({ ...d, background: c }))}
                    />
                  ))}
                  <label className={styles.customSwatch} style={{ background: doc.background }}>
                    <input type="color" value={doc.background} onChange={(e) => setDoc((d) => ({ ...d, background: e.target.value }))} />
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        <div className={styles.canvasArea}>
          <div ref={wrapRef} className={styles.canvasScaleWrap} style={{ aspectRatio: `${doc.width} / ${doc.height}` }}>
            <div
              className={styles.canvasInner}
              style={{ width: doc.width, height: doc.height, background: doc.background, transform: `scale(${scale})` }}
              onPointerDown={() => setSelectedId(null)}
            >
              {sortedElements.map((el) => (
                <ElementLayer
                  key={el.id}
                  el={el}
                  scale={scale}
                  selected={selectedId === el.id}
                  editing={editingId === el.id}
                  onSelect={() => setSelectedId(el.id)}
                  onStartEditing={() => {
                    setSelectedId(el.id);
                    setEditingId(el.id);
                  }}
                  onStopEditing={() => setEditingId(null)}
                  onChange={(patch) => updateElement(el.id, patch)}
                  onCommitText={(text) => updateElement(el.id, { text })}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Off-screen, always full-resolution — this is what actually gets captured for PNG export. */}
        <ExportCanvas
          width={doc.width}
          height={doc.height}
          onReady={(node, d) => {
            exportNodeRef.current = node;
            exportDocRef.current = d;
          }}
        >
          <DocSurface doc={doc} />
        </ExportCanvas>

        <div className={styles.rightPanel}>
          <PropertiesPanel
            el={selected}
            onChange={(patch) => selectedId && updateElement(selectedId, patch)}
            onDelete={() => selectedId && removeElement(selectedId)}
            onDuplicate={() => selectedId && duplicateElement(selectedId)}
            onBringForward={() => selectedId && reorder(selectedId, 1)}
            onSendBackward={() => selectedId && reorder(selectedId, -1)}
          />

          {design.status === "DRAFT" && (
            <form action={deleteDesignAction} className={styles.discardForm}>
              <input type="hidden" name="id" value={design.id} />
              <button
                type="submit"
                className={styles.linkBtn}
                onClick={(e) => {
                  if (!confirm("Discard this draft? This can't be undone.")) e.preventDefault();
                }}
              >
                Discard this draft
              </button>
            </form>
          )}
        </div>
      </div>

      <div className={styles.bottomBar}>
        <span>Drag to move, corner handles to resize, double-click text to edit</span>
        <span className={styles.zoomReadout}>{doc.width} × {doc.height}px · {Math.round(scale * 100)}%</span>
      </div>
    </div>
  );
}
