import Link from "next/link";
import { matchTemplates } from "@/lib/match-template";
import { designTemplates, templateCategories, type TemplateCategory } from "@/lib/design-templates";
import { IconSparkle, IconArrowRight } from "@/components/icons";
import shell from "@/components/AppShell.module.css";
import styles from "./design-engine.module.css";

export default async function DesignEnginePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q = "", category = "All" } = await searchParams;
  const cat = (templateCategories as readonly string[]).includes(category) ? (category as TemplateCategory) : "All";

  const results = matchTemplates(q, { category: cat === "All" ? "All" : cat, limit: 8 });

  return (
    <div>
      <h1 className={shell.h1} style={{ marginBottom: 4 }}>Design Engine</h1>
      <div className={styles.h1sub}>Describe what you need — get a finished design from our library, instantly.</div>

      <div className={styles.promptPanel}>
        <div className={styles.badgeRow}>
          <span className={styles.smartBadge}>
            <IconSparkle />
            SMART TEMPLATES · {designTemplates.length}+ DESIGNS
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
          <Link href="/design-engine?q=real+estate+open+house+flyer">&quot;real estate open house flyer&quot;</Link> ·{" "}
          <Link href="/design-engine?q=fitness+studio+logo">&quot;fitness studio logo&quot;</Link>
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

      <div className={`${styles.results} staggerChildren`}>
        {results.map((t) => (
          <div className={styles.tcard} key={t.id}>
            <div className={styles.thumb} style={{ background: `oklch(0.92 0.045 ${t.hue})` }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={`oklch(0.5 0.14 ${t.hue})`} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                <path d={t.iconPath} />
              </svg>
            </div>
            <div className={styles.tbody}>
              <div className={styles.tname}>{t.name}</div>
              <div className={styles.tmeta}>
                <span className={styles.tcat}>{t.category}</span>
                <Link className={styles.use} href={`/design-engine/use/${t.id}?q=${encodeURIComponent(q)}`}>Use →</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
