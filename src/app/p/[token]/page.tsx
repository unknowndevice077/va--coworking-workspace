import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { findTemplate } from "@/lib/graphic-templates";
import { approveDesignAction, requestChangesAction } from "./actions";
import { IconFile } from "@/components/icons";
import { ScaledCanvas } from "@/components/graphic/ScaledCanvas";
import styles from "./portal.module.css";

function initialsOf(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}
function money(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}
const STAGE_PROGRESS: Record<string, number> = { TODO: 10, IN_PROGRESS: 50, REVIEW: 80, DONE: 100 };

export default async function ClientPortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const client = await prisma.client.findUnique({
    where: { portalToken: token },
    include: {
      projects: { orderBy: { createdAt: "asc" } },
      files: { orderBy: { createdAt: "desc" } },
      invoices: { orderBy: { createdAt: "desc" } },
      designApprovals: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!client) notFound();

  const paidInvoices = client.invoices.filter((i) => i.status === "PAID");
  const nextInvoice = client.invoices.find((i) => i.status !== "PAID");

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <div className={styles.brandrow}>
          <div className={styles.clientmark}>{initialsOf(client.name)}</div>
          <div>
            <div className={styles.clientname}>{client.name}</div>
            <div className={styles.poweredby}>CLIENT PORTAL · POWERED BY VA HUB</div>
          </div>
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 600 }}>{client.contactName}</div>
      </div>

      <div className={`${styles.main} animIn`}>
        <div>
          <h1 className={styles.h1}>Welcome back, {client.contactName.split(" ")[0]}</h1>
          <div className={styles.panel}>
            <div className={styles.pt}>Active projects</div>
            {client.projects.length === 0 && <div style={{ color: "var(--sub)", fontSize: 13 }}>No projects yet.</div>}
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
            {client.designApprovals.length === 0 && <div style={{ color: "var(--sub)", fontSize: 13 }}>No designs yet.</div>}
            {client.designApprovals.map((approval) => {
              const template = findTemplate(approval.templateId);
              return (
                <div className={styles.approval} key={approval.id}>
                  <div className={styles.thumb}>
                    {template && (
                      <ScaledCanvas width={template.width} height={template.height}>
                        <template.Component values={approval.fields as Record<string, string>} hue={approval.hue} editable={false} />
                      </ScaledCanvas>
                    )}
                  </div>
                  <div className={styles.appinfo}>
                    <div className={styles.appname}>{template?.name ?? "Design"}</div>
                    <div className={styles.appmeta}>From your VA&apos;s design studio</div>
                    {approval.status === "PENDING" ? (
                      <div className={styles.appbtns}>
                        <form action={approveDesignAction}>
                          <input type="hidden" name="token" value={token} />
                          <input type="hidden" name="approvalId" value={approval.id} />
                          <button className={`${styles.abtn} ${styles.approve}`} type="submit">Approve</button>
                        </form>
                        <form action={requestChangesAction}>
                          <input type="hidden" name="token" value={token} />
                          <input type="hidden" name="approvalId" value={approval.id} />
                          <button className={`${styles.abtn} ${styles.request}`} type="submit">Request changes</button>
                        </form>
                      </div>
                    ) : (
                      <span
                        className={styles.statusPill}
                        style={
                          approval.status === "APPROVED"
                            ? { background: "var(--ok-soft)", color: "var(--ok)" }
                            : { background: "var(--warn-soft)", color: "var(--warn)" }
                        }
                      >
                        {approval.status === "APPROVED" ? "Approved" : "Changes requested"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <div className={styles.panel}>
            <div className={styles.pt}>Recent files</div>
            {client.files.length === 0 && <div style={{ color: "var(--sub)", fontSize: 13 }}>No files yet.</div>}
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
