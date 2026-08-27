import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DocSurface } from "@/lib/canvas-doc/render";
import { normalizeDoc } from "@/lib/canvas-doc/types";
import { ScaledCanvas } from "@/components/graphic/ScaledCanvas";
import { replyToDesignFeedbackAction } from "./actions";
import shell from "@/components/AppShell.module.css";
import ui from "@/components/ui.module.css";
import styles from "./thread.module.css";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Awaiting client review",
  APPROVED: "Approved",
  CHANGES_REQUESTED: "Changes requested",
};

export default async function DesignFeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const approval = await prisma.designApproval.findUnique({
    where: { id },
    include: { client: true, design: true, comments: { orderBy: { createdAt: "asc" } } },
  });
  if (!approval) notFound();

  const doc = normalizeDoc(approval.doc);
  if (!doc) notFound();

  return (
    <div>
      <div className={shell.topline}>
        <h1 className={shell.h1}>
          {approval.design?.name ?? "Design"}
          <span className={shell.h1sub}>Sent to {approval.client.name} · {STATUS_LABEL[approval.status]}</span>
        </h1>
        <Link href="/design-engine/sent" className={shell.btnGhost}>← Finished Designs</Link>
      </div>

      <div className={styles.layout}>
        <div className={styles.thumb}>
          <ScaledCanvas width={doc.width} height={doc.height}>
            <DocSurface doc={doc} />
          </ScaledCanvas>
        </div>
        <div className={ui.panel}>
          <div className={ui.pt}>Feedback</div>
          <div className={styles.msgs}>
            {approval.comments.length === 0 && <div className={ui.empty}>No comments yet.</div>}
            {approval.comments.map((c) => (
              <div className={`${styles.msg} ${c.fromVA ? styles.msgOut : styles.msgIn}`} key={c.id}>
                {c.body}
                <div className={styles.mtime}>{c.createdAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</div>
              </div>
            ))}
          </div>
          <form action={replyToDesignFeedbackAction} className={styles.composer}>
            <input type="hidden" name="approvalId" value={approval.id} />
            <input type="text" name="body" placeholder="Reply to the client…" autoComplete="off" />
            <button className={styles.sendbtn} type="submit">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}
