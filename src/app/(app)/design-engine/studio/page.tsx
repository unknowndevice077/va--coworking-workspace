import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { findTemplate } from "@/lib/graphic-templates";
import { ScaledCanvas } from "@/components/graphic/ScaledCanvas";
import shell from "@/components/AppShell.module.css";
import styles from "../design-engine.module.css";

// The VA's private design library. This route lives entirely under the
// authenticated (app) layout — there is no token or link that exposes it
// to a client; clients only ever see a design once it's been explicitly
// sent (see the "Send to client" tab in the studio editor), which is a
// separate, snapshotted DesignApproval row, not this list.
export default async function MyDesignsPage() {
  const designs = await prisma.design.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div>
      <div className={shell.topline}>
        <h1 className={shell.h1}>
          My Designs
          <span className={shell.h1sub}>Private to you — drafts stay here until you choose to send one.</span>
        </h1>
        <Link href="/design-engine" className={shell.btnGhost}>+ Browse templates</Link>
      </div>

      {designs.length === 0 ? (
        <div className={styles.emptyStudio}>
          You haven&apos;t started a design yet. <Link href="/design-engine">Browse the template library</Link> to start one.
        </div>
      ) : (
        <div className={`${styles.results} staggerChildren`}>
          {designs.map((d) => {
            const template = findTemplate(d.templateId);
            if (!template) return null;
            return (
              <Link href={`/design-engine/studio/${d.id}`} className={styles.tcard} key={d.id} style={{ display: "block" }}>
                <div className={styles.thumb}>
                  <ScaledCanvas width={template.width} height={template.height}>
                    <template.Component values={d.fields as Record<string, string>} hue={d.hue} editable={false} />
                  </ScaledCanvas>
                </div>
                <div className={styles.tbody}>
                  <div className={styles.tname}>{d.name}</div>
                  <div className={styles.tmeta}>
                    <span className={styles.tcat}>{template.category}</span>
                    <span className={styles.statusPill} data-sent={d.status === "SENT" ? "true" : "false"}>
                      {d.status === "SENT" ? "Sent" : "Draft"}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
