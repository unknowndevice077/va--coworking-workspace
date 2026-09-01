import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { DocSurface } from "@/lib/canvas-doc/render";
import { normalizeDoc } from "@/lib/canvas-doc/types";
import { ScaledCanvas } from "@/components/graphic/ScaledCanvas";
import { sendDesignAction } from "../actions";
import shell from "@/components/AppShell.module.css";
import styles from "../design-engine.module.css";

// The VA's private design library. This route lives entirely under the
// authenticated (app) layout — there is no token or link that exposes it
// to a client. A design here is pure work-in-progress: edit and save it
// in the studio, then send it to a client right from its card below —
// sending snapshots it into a DesignApproval, which shows up under
// "Finished Designs" once it's gone out.
export default async function MyDesignsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [designs, clients] = await Promise.all([
    prisma.design.findMany({ where: { workspaceId: user.workspaceId }, orderBy: { updatedAt: "desc" } }),
    prisma.client.findMany({ where: { workspaceId: user.workspaceId }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <div className={shell.topline}>
        <h1 className={shell.h1}>
          My Designs
          <span className={shell.h1sub}>Private to you — edit and save here, then send a finished one to a client below.</span>
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
            const doc = normalizeDoc(d.doc);
            if (!doc) return null;
            const elementCount = doc.pages.reduce((n, p) => n + p.elements.length, 0);
            return (
              <div className={styles.tcard} key={d.id}>
                <Link href={`/design-engine/studio/${d.id}`} style={{ display: "block" }}>
                  <div className={styles.thumb}>
                    <ScaledCanvas width={doc.width} height={doc.height}>
                      <DocSurface doc={doc} />
                    </ScaledCanvas>
                  </div>
                </Link>
                <div className={styles.tbody}>
                  <Link href={`/design-engine/studio/${d.id}`} className={styles.tname} style={{ display: "block" }}>
                    {d.name}
                  </Link>
                  <div className={styles.tmeta}>
                    <span className={styles.tcat}>
                      {doc.pages.length > 1 ? `${doc.pages.length} pages · ` : ""}
                      {elementCount} element{elementCount === 1 ? "" : "s"}
                    </span>
                    <span className={styles.statusPill} data-sent={d.status === "SENT" ? "true" : "false"}>
                      {d.status === "SENT" ? "Sent" : "Draft"}
                    </span>
                  </div>
                  <Link href={`/design-engine/studio/${d.id}/remix`} className={styles.commentCount} style={{ display: "inline-block", margin: "6px 0" }}>
                    Remix — 3 variations →
                  </Link>
                  {clients.length > 0 && (
                    <form action={sendDesignAction} className={styles.sendForm}>
                      <input type="hidden" name="designId" value={d.id} />
                      <select name="clientId" className={styles.sendSelect} required defaultValue="">
                        <option value="" disabled>Send to client…</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <button type="submit" className={styles.sendBtn} aria-label="Send for approval">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="m5 12 14-7-7 14-2-6-5-1Z" />
                        </svg>
                      </button>
                    </form>
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
