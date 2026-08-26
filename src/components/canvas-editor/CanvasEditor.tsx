"use client";

import { useEffect, useRef, useState, useActionState } from "react";
import Link from "next/link";
import { ElementLayer } from "./ElementLayer";
import { PropertiesPanel } from "./PropertiesPanel";
import { ExportCanvas } from "@/components/graphic/ExportCanvas";
import { DocSurface } from "@/lib/canvas-doc/render";
import { newElId } from "@/lib/canvas-doc/types";
import type { CanvasDoc, DesignElement, DistributiveOmit } from "@/lib/canvas-doc/types";
import { updateDesignAction, sendDesignAction, deleteDesignAction } from "@/app/(app)/design-engine/actions";
import shell from "@/components/AppShell.module.css";
import loginStyles from "@/app/login/login.module.css";
import styles from "./canvas-editor.module.css";

type DesignRow = { id: string; name: string; doc: CanvasDoc; status: string };

const BG_SWATCHES = ["#ffffff", "#f4f3f0", "#131b26", "#1f4b36", "#5c1f2e", "#163a4d", "#0f2a44", "#eaf3ec"];

function nextZ(elements: DesignElement[]) {
  return elements.reduce((m, e) => Math.max(m, e.zIndex), 0) + 1;
}

export function CanvasEditor({
  design,
  clients,
  approvals,
}: {
  design: DesignRow;
  clients: { id: string; name: string }[];
  approvals: { id: string; status: string; clientName: string }[];
}) {
  const [tab, setTab] = useState<"edit" | "send">("edit");
  const [name, setName] = useState(design.name);
  const [doc, setDoc] = useState<CanvasDoc>(design.doc);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [scale, setScale] = useState(0.001);
  const [downloading, setDownloading] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportNodeRef = useRef<HTMLDivElement | null>(null);
  const exportDocRef = useRef<Document | null>(null);

  const [saveState, saveAction, savePending] = useActionState(updateDesignAction, undefined);
  const [sendState, sendActionFn, sendPending] = useActionState(sendDesignAction, undefined);

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
    setTab("edit");
  }

  function addText() {
    const w = Math.round(doc.width * 0.5);
    addElement({
      type: "text",
      x: Math.round((doc.width - w) / 2),
      y: Math.round(doc.height / 2 - 30),
      w,
      h: 60,
      text: "Double-click to edit",
      fontFamily: "body",
      fontSize: 28,
      fontWeight: 600,
      color: "#131b26",
      align: "left",
      lineHeight: 1.2,
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

  function addIcon() {
    addElement({
      type: "icon",
      x: Math.round(doc.width / 2 - 32),
      y: Math.round(doc.height / 2 - 32),
      w: 64,
      h: 64,
      icon: "sparkle",
      color: "#131b26",
    });
  }

  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
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

  const sortedElements = [...doc.elements].sort((a, b) => a.zIndex - b.zIndex);
  const docJson = JSON.stringify(doc);

  return (
    <div>
      <div className={shell.topline}>
        <h1 className={shell.h1}>
          {name || "Untitled design"}
          <span className={shell.h1sub}>
            {design.status === "SENT" ? "Sent to a client" : "Draft — only you can see this"} · {doc.elements.length} element{doc.elements.length === 1 ? "" : "s"}
          </span>
        </h1>
        <Link href="/design-engine/studio" className={shell.btnGhost}>← My Designs</Link>
      </div>

      <div className={styles.editorLayout}>
        <div className={styles.leftRail}>
          <button type="button" className={styles.railBtn} onClick={addText}>
            <span className={styles.railIcon} aria-hidden="true">T</span>
            Text
          </button>
          <button type="button" className={styles.railBtn} onClick={() => addShape("rect")}>
            <span className={styles.railIcon} aria-hidden="true" style={{ borderRadius: 3 }}>▭</span>
            Rectangle
          </button>
          <button type="button" className={styles.railBtn} onClick={() => addShape("ellipse")}>
            <span className={styles.railIcon} aria-hidden="true">●</span>
            Circle
          </button>
          <button type="button" className={styles.railBtn} onClick={() => addShape("line")}>
            <span className={styles.railIcon} aria-hidden="true">—</span>
            Line
          </button>
          <button type="button" className={styles.railBtn} onClick={addIcon}>
            <span className={styles.railIcon} aria-hidden="true">✦</span>
            Icon
          </button>
          <button type="button" className={styles.railBtn} onClick={() => fileInputRef.current?.click()}>
            <span className={styles.railIcon} aria-hidden="true">▨</span>
            Image
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImagePick} />
        </div>

        <div className={styles.canvasCol}>
          <div
            ref={wrapRef}
            className={styles.canvasScaleWrap}
            style={{ aspectRatio: `${doc.width} / ${doc.height}` }}
          >
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
          <div className={styles.canvasHint}>
            Drag to move, corner handles to resize, double-click text to edit. Delete/Backspace removes the selected element.
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
          <div className={styles.tabRow}>
            <button type="button" className={`${styles.tabBtn} ${tab === "edit" ? styles.tabActive : ""}`} onClick={() => setTab("edit")}>
              Edit design
            </button>
            <button type="button" className={`${styles.tabBtn} ${tab === "send" ? styles.tabActive : ""}`} onClick={() => setTab("send")}>
              Send to client
            </button>
          </div>

          {tab === "edit" ? (
            <div>
              <div className={styles.propGroup}>
                <div className={styles.propLabel}>Draft name</div>
                <input className={loginStyles.input} value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className={styles.propGroup}>
                <div className={styles.propLabel}>Canvas background</div>
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

              <div className={styles.divider} />

              <PropertiesPanel
                el={selected}
                onChange={(patch) => selectedId && updateElement(selectedId, patch)}
                onDelete={() => selectedId && removeElement(selectedId)}
                onDuplicate={() => selectedId && duplicateElement(selectedId)}
                onBringForward={() => selectedId && reorder(selectedId, 1)}
                onSendBackward={() => selectedId && reorder(selectedId, -1)}
              />

              <div className={styles.divider} />

              <form action={saveAction} className={loginStyles.form}>
                <input type="hidden" name="id" value={design.id} />
                <input type="hidden" name="name" value={name} />
                <input type="hidden" name="doc" value={docJson} />
                {saveState?.error && <div className={loginStyles.error}>{saveState.error}</div>}
                <button className={loginStyles.btn} type="submit" disabled={savePending}>
                  {savePending ? "Saving…" : saveState?.saved ? "Saved ✓" : "Save draft"}
                </button>
                <button type="button" className={shell.btnGhost} disabled={downloading} onClick={handleDownload} style={{ width: "100%" }}>
                  {downloading ? "Rendering…" : "Download PNG"}
                </button>
              </form>

              {design.status === "DRAFT" && (
                <form action={deleteDesignAction} style={{ marginTop: 10 }}>
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
          ) : (
            <div>
              <form action={sendActionFn} className={loginStyles.form}>
                <input type="hidden" name="designId" value={design.id} />
                <input type="hidden" name="doc" value={docJson} />
                <label className={loginStyles.label}>
                  Send to client
                  <select className={loginStyles.input} name="clientId" required>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </label>
                <p className={loginStyles.sub} style={{ margin: 0 }}>
                  Delivers the design exactly as shown to their portal for approval. Nothing is sent until you click below.
                </p>
                {sendState?.error && <div className={loginStyles.error}>{sendState.error}</div>}
                <button className={loginStyles.btn} type="submit" disabled={sendPending}>
                  {sendPending ? "Sending…" : "Send for approval"}
                </button>
                <button type="button" className={shell.btnGhost} disabled={downloading} onClick={handleDownload} style={{ width: "100%" }}>
                  {downloading ? "Rendering…" : "Download PNG"}
                </button>
              </form>

              {approvals.length > 0 && (
                <div style={{ marginTop: 22 }}>
                  <div className={styles.sentTitle}>Already sent to</div>
                  {approvals.map((a) => (
                    <div key={a.id} className={styles.sentRow}>
                      <span>{a.clientName}</span>
                      <span className={styles.sentStatus}>{a.status.replace("_", " ").toLowerCase()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
