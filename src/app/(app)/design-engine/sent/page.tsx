import type { CSSProperties } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DocSurface } from "@/lib/canvas-doc/render";
import { isValidDoc, type CanvasDoc } from "@/lib/canvas-doc/types";
import { ScaledCanvas } from "@/components/graphic/ScaledCanvas";
import shell from "@/components/AppShell.module.css";
import styles from "../design-engine.module.css";

const STATUS_STYLE: Record<string, CSSProperties> = {
  PENDING: { background: "var(--muted-badge)", color: "var(--sub)" },
  APPROVED: { background: "var(--ok-soft)", color: "var(--ok)" },
  CHANGES_REQUESTED: { background: "var(--warn-soft)", color: "var(--warn)" },
};

// Everything that has actually gone out to a client — one card per
// DesignApproval, the immutable snapshot taken the moment it was sent.
// This is deliberately separate from "My Designs": that's the private,
// still-editable studio; this is the read-only record of what clients
// have actually seen and how they responded.
export default async function FinishedDesignsPage() {
  const approvals = await prisma.designApproval.findMany({
    include: { client: true, design: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className={shell.topline}>
        <h1 className={shell.h1}>
          Finished Designs
          <span className={shell.h1sub}>Every design you&apos;ve sent for approval, and how each client responded.</span>
        </h1>
        <Link href="/design-engine/studio" className={shell.btnGhost}>My Designs →</Link>
      </div>

      {approvals.length === 0 ? (
        <div className={styles.emptyStudio}>
          Nothing sent yet. Finish a design in <Link href="/design-engine/studio">My Designs</Link> and send it to a client to see it here.
        </div>
      ) : (
        <div className={`${styles.results} staggerChildren`}>
          {approvals.map((a) => {
            if (!isValidDoc(a.doc)) return null;
            const doc = a.doc as CanvasDoc;
            return (
              <div className={styles.tcard} key={a.id}>
                <div className={styles.thumb}>
                  <ScaledCanvas width={doc.width} height={doc.height}>
                    <DocSurface doc={doc} />
                  </ScaledCanvas>
                </div>
                <div className={styles.tbody}>
                  <div className={styles.tname}>{a.design?.name ?? "Design"}</div>
                  <div className={styles.tmeta}>
                    <span className={styles.tcat}>{a.client.name}</span>
                    <span className={styles.statusPill} style={STATUS_STYLE[a.status]}>
                      {a.status.replace("_", " ").toLowerCase()}
                    </span>
                  </div>
                  {a.designId && (
                    <Link href={`/design-engine/studio/${a.designId}`} className={styles.use} style={{ display: "inline-block", marginTop: 8 }}>
                      Reopen design →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
