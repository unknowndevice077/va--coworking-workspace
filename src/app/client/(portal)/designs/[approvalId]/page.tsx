import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentClient } from "@/lib/client-auth";
import { prisma } from "@/lib/prisma";
import { DocSurface } from "@/lib/canvas-doc/render";
import { normalizeDoc } from "@/lib/canvas-doc/types";
import { ScaledCanvas } from "@/components/graphic/ScaledCanvas";
import { approveDesignAction, requestChangesAction, postDesignCommentAction } from "./actions";
import styles from "../../portal.module.css";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Awaiting your review",
  APPROVED: "Approved",
  CHANGES_REQUESTED: "Changes requested",
};

export default async function ClientDesignReviewPage({ params }: { params: Promise<{ approvalId: string }> }) {
  const session = await getCurrentClient();
  if (!session) redirect("/client/login");

  const approval = await prisma.designApproval.findUnique({
    where: { id: (await params).approvalId },
    include: { comments: { orderBy: { createdAt: "asc" } } },
  });
  if (!approval || approval.clientId !== session.id) notFound();

  const doc = normalizeDoc(approval.doc);
  if (!doc) notFound();

  return (
    <div className={styles.main} style={{ gridTemplateColumns: "1.2fr 1fr" }}>
      <div>
        <Link href="/client" className={styles.backlink}>← Back to dashboard</Link>
        <div className={styles.panel}>
          <div className={styles.thumb} style={{ width: "100%" }}>
            <ScaledCanvas width={doc.width} height={doc.height}>
              <DocSurface doc={doc} />
            </ScaledCanvas>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
            <span
              className={styles.statusPill}
              style={
                approval.status === "APPROVED"
                  ? { background: "var(--ok-soft)", color: "var(--ok)" }
                  : approval.status === "CHANGES_REQUESTED"
                    ? { background: "var(--warn-soft)", color: "var(--warn)" }
                    : { background: "var(--accent-soft)", color: "var(--accent)" }
              }
            >
              {STATUS_LABEL[approval.status]}
            </span>
            <div className={styles.appbtns}>
              <form action={requestChangesAction}>
                <input type="hidden" name="approvalId" value={approval.id} />
                <button className={`${styles.abtn} ${styles.request}`} type="submit">Request changes</button>
              </form>
              <form action={approveDesignAction}>
                <input type="hidden" name="approvalId" value={approval.id} />
                <button className={`${styles.abtn} ${styles.approve}`} type="submit">Approve</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className={styles.panel}>
          <div className={styles.pt}>Feedback</div>
          <div className={styles.msgs}>
            {approval.comments.length === 0 && (
              <div className={styles.empty}>No comments yet — tell your VA what you think, even after approving.</div>
            )}
            {approval.comments.map((c) => (
              <div className={`${styles.msg} ${c.fromVA ? styles.msgIn : styles.msgOut}`} key={c.id}>
                {c.body}
                <div className={styles.mtime}>{c.createdAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</div>
              </div>
            ))}
          </div>
          <form action={postDesignCommentAction} className={styles.composer}>
            <input type="hidden" name="approvalId" value={approval.id} />
            <input type="text" name="body" placeholder="Leave a comment…" autoComplete="off" />
            <button className={styles.sendbtn} type="submit">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}
