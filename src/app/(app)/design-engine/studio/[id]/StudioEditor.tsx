"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { TemplateThumb } from "@/components/TemplateThumb";
import { updateDesignAction, sendDesignAction, deleteDesignAction } from "../../actions";
import type { DesignTemplate } from "@/lib/design-templates";
import shell from "@/components/AppShell.module.css";
import loginStyles from "@/app/login/login.module.css";
import styles from "../../design-engine.module.css";

// A curated color set (not a full picker) — keeps every design looking like
// it came from a professional template, matching the honest "Smart
// Templates, not generative AI" positioning of the rest of the engine.
const PALETTE = [340, 255, 220, 190, 150, 120, 95, 78, 45, 30, 0, 275];

type DesignRow = {
  id: string;
  name: string;
  headline: string;
  sub: string | null;
  tag: string | null;
  hue: number;
  status: string;
};

export function StudioEditor({
  design,
  template,
  clients,
  approvals,
}: {
  design: DesignRow;
  template: DesignTemplate;
  clients: { id: string; name: string }[];
  approvals: { id: string; status: string; clientName: string }[];
}) {
  const [tab, setTab] = useState<"edit" | "send">("edit");
  const [name, setName] = useState(design.name);
  const [headline, setHeadline] = useState(design.headline);
  const [sub, setSub] = useState(design.sub ?? "");
  const [tag, setTag] = useState(design.tag ?? "");
  const [hue, setHue] = useState(design.hue);

  const [saveState, saveAction, savePending] = useActionState(updateDesignAction, undefined);
  const [sendState, sendActionFn, sendPending] = useActionState(sendDesignAction, undefined);

  const showSub = template.category !== "Logo";
  const showTag = template.category === "Social Post" || template.category === "Flyer";

  const preview: DesignTemplate = {
    ...template,
    headline: headline || "Your headline here",
    sub: showSub ? sub || undefined : undefined,
    tag: showTag ? tag || undefined : undefined,
    hue,
  };

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
        <div className={styles.canvasWrap}>
          <TemplateThumb template={preview} variant="hero" />
        </div>

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
                Headline
                <input
                  className={loginStyles.input}
                  name="headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  required
                />
              </label>
              {showSub && (
                <label className={loginStyles.label}>
                  Subtext
                  <input className={loginStyles.input} name="sub" value={sub} onChange={(e) => setSub(e.target.value)} />
                </label>
              )}
              {showTag && (
                <label className={loginStyles.label}>
                  Badge / tag
                  <input className={loginStyles.input} name="tag" value={tag} onChange={(e) => setTag(e.target.value)} />
                </label>
              )}
              <label className={loginStyles.label}>
                Color
                <div className={styles.swatchRow}>
                  {PALETTE.map((h) => (
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
