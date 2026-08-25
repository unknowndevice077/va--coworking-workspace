"use client";

import { useRef, useState, useActionState } from "react";
import Link from "next/link";
import { ScaledCanvas } from "@/components/graphic/ScaledCanvas";
import { ExportCanvas } from "@/components/graphic/ExportCanvas";
import { findTemplate } from "@/lib/graphic-templates";
import { updateDesignAction, sendDesignAction, deleteDesignAction } from "../../actions";
import shell from "@/components/AppShell.module.css";
import loginStyles from "@/app/login/login.module.css";
import styles from "../../design-engine.module.css";

// A curated color set (not a full picker) — keeps every design looking like
// it came from a professional template, matching the honest "Smart
// Templates, not generative AI" positioning of the rest of the engine.
const PALETTE_HUES = [150, 265, 25, 210, 255, 190, 235, 340, 45, 95, 20, 300];

type DesignRow = {
  id: string;
  name: string;
  fields: Record<string, string>;
  hue: number;
  status: string;
  templateId: string;
};

export function StudioEditor({
  design,
  clients,
  approvals,
}: {
  design: DesignRow;
  clients: { id: string; name: string }[];
  approvals: { id: string; status: string; clientName: string }[];
}) {
  const template = findTemplate(design.templateId);

  const [tab, setTab] = useState<"edit" | "send">("edit");
  const [name, setName] = useState(design.name);
  const [fields, setFields] = useState<Record<string, string>>(design.fields);
  const [hue, setHue] = useState(design.hue);
  const [downloading, setDownloading] = useState(false);

  const exportNodeRef = useRef<HTMLDivElement | null>(null);
  const exportDocRef = useRef<Document | null>(null);

  const [saveState, saveAction, savePending] = useActionState(updateDesignAction, undefined);
  const [sendState, sendActionFn, sendPending] = useActionState(sendDesignAction, undefined);

  if (!template) {
    return (
      <div className={styles.emptyStudio}>
        This design&apos;s template no longer exists in the library. <Link href="/design-engine/studio">Back to My Designs</Link>
      </div>
    );
  }

  const handleEdit = (key: string, value: string) => setFields((prev) => ({ ...prev, [key]: value }));

  async function handleDownload() {
    setDownloading(true);
    try {
      const node = exportNodeRef.current;
      const doc = exportDocRef.current;
      if (!node || !doc) {
        alert("Still getting the canvas ready — try again in a second.");
        return;
      }
      const { default: html2canvas } = await import("html2canvas");
      await doc.fonts.ready;
      const canvas = await html2canvas(node, { useCORS: true, backgroundColor: "#ffffff", scale: 2 });
      const link = document.createElement("a");
      link.download = `${(name || template!.name).replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error(e);
      alert("Download failed — please try again.");
    } finally {
      setDownloading(false);
    }
  }

  const fieldsJson = JSON.stringify(fields);

  return (
    <div>
      <div className={shell.topline}>
        <h1 className={shell.h1}>
          {name || "Untitled design"}
          <span className={shell.h1sub}>
            {template.category} · {design.status === "SENT" ? "Sent to a client" : "Draft — only you can see this"}
          </span>
        </h1>
        <Link href="/design-engine/studio" className={shell.btnGhost}>← My Designs</Link>
      </div>

      <div className={styles.studioLayout}>
        <div className={styles.canvasCol}>
          <div className={styles.canvasWrap}>
            <ScaledCanvas width={template.width} height={template.height}>
              <template.Component values={fields} hue={hue} editable={tab === "edit"} onEdit={handleEdit} />
            </ScaledCanvas>
          </div>
          {tab === "edit" && <div className={styles.canvasHint}>Click any text on the design to edit it in place.</div>}
        </div>

        {/* Off-screen, always full-resolution and non-editable — this is what actually gets captured for PNG export. */}
        <ExportCanvas
          width={template.width}
          height={template.height}
          onReady={(node, doc) => {
            exportNodeRef.current = node;
            exportDocRef.current = doc;
          }}
        >
          <template.Component values={fields} hue={hue} editable={false} />
        </ExportCanvas>

        <div className={styles.studioPanel}>
          <div className={styles.tabRow}>
            <button
              type="button"
              className={`${styles.tabBtn} ${tab === "edit" ? styles.tabActive : ""}`}
              onClick={() => setTab("edit")}
            >
              Edit design
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${tab === "send" ? styles.tabActive : ""}`}
              onClick={() => setTab("send")}
            >
              Send to client
            </button>
          </div>

          {tab === "edit" ? (
            <form action={saveAction} className={loginStyles.form}>
              <input type="hidden" name="id" value={design.id} />
              <input type="hidden" name="hue" value={hue} />
              <input type="hidden" name="fields" value={fieldsJson} />
              <label className={loginStyles.label}>
                Draft name
                <input
                  className={loginStyles.input}
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>

              <label className={loginStyles.label}>
                Color
                <div className={styles.swatchRow}>
                  {PALETTE_HUES.map((h) => (
                    <button
                      key={h}
                      type="button"
                      aria-label={`Use hue ${h}`}
                      className={`${styles.swatch} ${hue === h ? styles.swatchOn : ""}`}
                      style={{ background: `oklch(0.6 0.14 ${h})` }}
                      onClick={() => setHue(h)}
                    />
                  ))}
                </div>
              </label>

              {saveState?.error && <div className={loginStyles.error}>{saveState.error}</div>}
              <button className={loginStyles.btn} type="submit" disabled={savePending}>
                {savePending ? "Saving…" : saveState?.saved ? "Saved ✓" : "Save draft"}
              </button>
              <button type="button" className={shell.btnGhost} disabled={downloading} onClick={handleDownload} style={{ width: "100%" }}>
                {downloading ? "Rendering…" : "Download PNG"}
              </button>
            </form>
          ) : null}

          {tab === "edit" && design.status === "DRAFT" && (
            <form action={deleteDesignAction} style={{ marginTop: 10 }}>
              <input type="hidden" name="id" value={design.id} />
              <button
                type="submit"
                className={styles.use}
                style={{ color: "var(--bad)" }}
                onClick={(e) => {
                  if (!confirm("Discard this draft? This can't be undone.")) e.preventDefault();
                }}
              >
                Discard this draft
              </button>
            </form>
          )}

          {tab === "send" && (
            <div>
              <form action={sendActionFn} className={loginStyles.form}>
                <input type="hidden" name="designId" value={design.id} />
                <input type="hidden" name="hue" value={hue} />
                <input type="hidden" name="fields" value={fieldsJson} />
                <label className={loginStyles.label}>
                  Send to client
                  <select className={loginStyles.input} name="clientId" required>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </label>
                <p className={loginStyles.sub} style={{ margin: 0 }}>
                  Delivers the design exactly as shown on the left to their portal for approval. Nothing is sent until you click below.
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
