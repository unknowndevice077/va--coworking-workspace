import Link from "next/link";
import { matchPresets, templateCategories, type TemplateCategory } from "@/lib/canvas-doc/presets";
import { DocSurface } from "@/lib/canvas-doc/render";
import { IconSparkle, IconArrowRight, IconPlus } from "@/components/icons";
import { ScaledCanvas } from "@/components/graphic/ScaledCanvas";
import { createDesignAction } from "./actions";
import shell from "@/components/AppShell.module.css";
import styles from "./design-engine.module.css";

export default async function DesignEnginePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q = "", category = "All" } = await searchParams;
  const cat = (templateCategories as readonly string[]).includes(category) ? (category as TemplateCategory) : "All";

  const results = matchPresets(q, { category: cat === "All" ? "All" : cat, limit: 40 });

  return (
    <div>
      <div className={shell.topline}>
        <h1 className={shell.h1}>
          Design Engine
          <span className={shell.h1sub}>A fully editable canvas, Canva-style — drag, resize, add anything. Nothing reaches a client until you send it.</span>
        </h1>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/design-engine/auto" className={shell.btn}>
            <IconSparkle />
            Auto Design
          </Link>
          <Link href="/design-engine/studio" className={shell.btnGhost}>My Designs →</Link>
        </div>
      </div>

      <div className={styles.promptPanel}>
        <div className={styles.badgeRow}>
          <span className={styles.smartBadge}>
            <IconSparkle />
            SMART TEMPLATES · FULLY EDITABLE CANVAS
          </span>
        </div>
        <form method="get" className={styles.promptbox}>
          {cat !== "All" && <input type="hidden" name="category" value={cat} />}
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Describe the design you need — e.g. &quot;Instagram post announcing our fall bakery menu&quot;"
          />
          <button className={styles.gobtn} type="submit">
            <IconArrowRight />
            Match template
          </button>
        </form>
        <div className={styles.trynote}>
          Matched instantly from our template library, no waiting. Try:{" "}
          <Link href="/design-engine?q=open+house+event+flyer">&quot;open house event flyer&quot;</Link> ·{" "}
          <Link href="/design-engine?q=logo+for+a+law+firm">&quot;logo for a law firm&quot;</Link>
        </div>
      </div>

      <div className={styles.filters}>
        <Link href={`/design-engine${q ? `?q=${encodeURIComponent(q)}` : ""}`} className={`${shell.btnGhost}`} style={cat === "All" ? { background: "var(--accent-fill)", color: "#fff", borderColor: "var(--accent-fill)" } : undefined}>
          All
        </Link>
        {templateCategories.map((c) => (
          <Link
            key={c}
            href={`/design-engine?category=${encodeURIComponent(c)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={shell.btnGhost}
            style={cat === c ? { background: "var(--accent-fill)", color: "#fff", borderColor: "var(--accent-fill)" } : undefined}
          >
            {c}
          </Link>
        ))}
      </div>

      <div className={styles.blankRow}>
        {cat !== "All" && (
          <form action={createDesignAction}>
            <input type="hidden" name="category" value={cat} />
            <button className={shell.btn} type="submit">
              <IconPlus />
              Start blank {cat.toLowerCase()}
            </button>
          </form>
        )}
        <form action={createDesignAction} className={styles.customSizeForm}>
          <span className={styles.customSizeLabel}>Custom size:</span>
          <input type="number" name="customWidth" placeholder="Width" min={100} max={4000} required />
          <span>×</span>
          <input type="number" name="customHeight" placeholder="Height" min={100} max={4000} required />
          <span>px</span>
          <button className={shell.btnGhost} type="submit">Create blank canvas</button>
        </form>
      </div>

      <div className={`${styles.results} staggerChildren`}>
        {results.map((t) => (
          <div className={styles.tcard} key={t.id}>
            <div className={styles.thumb}>
              <ScaledCanvas width={t.doc.width} height={t.doc.height}>
                <DocSurface doc={t.doc} />
              </ScaledCanvas>
            </div>
            <div className={styles.tbody}>
              <div className={styles.tname}>{t.name}</div>
              <div className={styles.tmeta}>
                <span className={styles.tcat}>{t.category}</span>
                <form action={createDesignAction}>
                  <input type="hidden" name="templateId" value={t.id} />
                  <input type="hidden" name="promptText" value={q} />
                  <button className={styles.use} type="submit">Design this →</button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
