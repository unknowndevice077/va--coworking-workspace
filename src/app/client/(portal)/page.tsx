import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentClient } from "@/lib/client-auth";
import { prisma } from "@/lib/prisma";
import { DocSurface } from "@/lib/canvas-doc/render";
import { normalizeDoc } from "@/lib/canvas-doc/types";
import { ScaledCanvas } from "@/components/graphic/ScaledCanvas";
import { IconFile } from "@/components/icons";
import { isStripeConfigured } from "@/lib/stripe";
import { createCheckoutSessionAction } from "./invoices/actions";
import styles from "./portal.module.css";

function money(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}
const STAGE_PROGRESS: Record<string, number> = { TODO: 10, IN_PROGRESS: 50, REVIEW: 80, DONE: 100 };
const STATUS_LABEL: Record<string, string> = {
  PENDING: "Awaiting your review",
  APPROVED: "Approved",
  CHANGES_REQUESTED: "Changes requested",
};

export default async function ClientDashboardPage() {
  const session = await getCurrentClient();
  if (!session) redirect("/client/login");

  const client = await prisma.client.findUnique({
    where: { id: session.id },
    include: {
      projects: { orderBy: { createdAt: "asc" } },
      files: { orderBy: { createdAt: "desc" } },
      invoices: { orderBy: { createdAt: "desc" } },
      designApprovals: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!client) redirect("/client/login");

  const paidInvoices = client.invoices.filter((i) => i.status === "PAID");
  const nextInvoice = client.invoices.find((i) => i.status !== "PAID");

  return (
    <div className={`${styles.main} animIn`}>
      <div>
        <h1 className={styles.h1}>Welcome back, {client.contactName.split(" ")[0]}</h1>
        <div className={styles.panel}>
          <div className={styles.pt}>Active projects</div>
          {client.projects.length === 0 && <div className={styles.empty}>No projects yet.</div>}
          {client.projects.map((p) => (
            <div className={styles.proj} key={p.id}>
              <div className={styles.projrow}>
                <span className={styles.projname}>{p.title}</span>
                <span className={styles.projpct}>{STAGE_PROGRESS[p.status]}%</span>
              </div>
              <div className={styles.bar}><div className={styles.fill} style={{ width: `${STAGE_PROGRESS[p.status]}%` }} /></div>
            </div>
          ))}
        </div>
        <div className={styles.panel}>
          <div className={styles.pt}>Designs</div>
          {client.designApprovals.length === 0 && <div className={styles.empty}>No designs yet.</div>}
          {client.designApprovals.map((approval) => {
            const doc = normalizeDoc(approval.doc);
            if (!doc) return null;
            return (
              <Link href={`/client/designs/${approval.id}`} className={styles.approval} key={approval.id}>
                <div className={styles.thumb}>
                  <ScaledCanvas width={doc.width} height={doc.height}>
                    <DocSurface doc={doc} />
                  </ScaledCanvas>
                </div>
                <div className={styles.appinfo}>
                  <div className={styles.appname}>Design</div>
                  <div className={styles.appmeta}>From your VA&apos;s design studio · tap to review & comment</div>
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
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <div>
        <div className={styles.panel}>
          <div className={styles.pt}>Recent files</div>
          {client.files.length === 0 && <div className={styles.empty}>No files yet.</div>}
          <div className={styles.filelist}>
            {client.files.map((f) => (
              <div className={styles.frow} key={f.id}>
                <div className={styles.fdot}><IconFile /></div>
                <div className={styles.fname}>{f.filename}</div>
                <div className={styles.fsize}>{f.sizeLabel}</div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.panel}>
          <div className={styles.pt}>Invoices</div>
          {paidInvoices.slice(0, 2).map((inv) => (
            <div className={styles.invrow} key={inv.id}>
              <span className={styles.invlbl}>Invoice #{inv.number}</span>
              <span className={styles.invval} style={{ color: "var(--ok)" }}>Paid</span>
            </div>
          ))}
          {nextInvoice && (
            <div className={styles.invrow}>
              <span className={styles.invlbl}>Next invoice</span>
              <span className={styles.invval}>{money(nextInvoice.amountCents)}{nextInvoice.dueLabel ? ` · ${nextInvoice.dueLabel}` : ""}</span>
              {isStripeConfigured() && (
                <form action={createCheckoutSessionAction}>
                  <input type="hidden" name="invoiceId" value={nextInvoice.id} />
                  <button className={styles.payBtn} type="submit">Pay now</button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
