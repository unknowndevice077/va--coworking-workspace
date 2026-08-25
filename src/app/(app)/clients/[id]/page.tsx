import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import shell from "@/components/AppShell.module.css";
import ui from "@/components/ui.module.css";

function money(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}
function badgeClass(status: string) {
  const map: Record<string, string> = {
    ACTIVE: ui.badgeActive,
    ONBOARDING: ui.badgeOnboarding,
    PAUSED: ui.badgePaused,
    PAID: ui.badgePaid,
    PENDING: ui.badgePending,
    OVERDUE: ui.badgeOverdue,
    DRAFT: ui.badgeDraft,
  };
  return `${ui.badge} ${map[status] ?? ""}`;
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      projects: { orderBy: { createdAt: "asc" } },
      invoices: { orderBy: { createdAt: "desc" } },
      files: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!client) notFound();

  return (
    <div>
      <div className={shell.topline}>
        <h1 className={shell.h1}>
          {client.name}
          <span className={shell.h1sub}>{client.contactName} · {client.contactEmail}</span>
        </h1>
        <Link href={`/p/${client.portalToken}`} target="_blank" className={shell.btnGhost}>
          View client portal ↗
        </Link>
      </div>

      <div className={`${ui.statsThree} staggerChildren`}>
        <div className={ui.stat}>
          <div className={ui.statLbl}>STATUS</div>
          <div className={ui.statVal} style={{ fontSize: 16 }}>
            <span className={badgeClass(client.status)}>{client.status.charAt(0) + client.status.slice(1).toLowerCase()}</span>
          </div>
        </div>
        <div className={ui.stat}>
          <div className={ui.statLbl}>MONTHLY VALUE</div>
          <div className={ui.statVal}>{money(client.monthlyValueCents)}</div>
        </div>
        <div className={ui.stat}>
          <div className={ui.statLbl}>SERVICES</div>
          <div className={ui.tags} style={{ marginTop: 4 }}>
            {client.services.split(",").map((s) => (
              <span className={ui.tag} key={s}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      <div className={ui.grid2}>
        <div className={ui.col}>
          <div className={ui.panel}>
            <div className={ui.ph}>
              <div className={ui.pt}>Projects</div>
              <Link className={ui.pl} href="/projects">Board view</Link>
            </div>
            {client.projects.length === 0 && <div className={ui.empty}>No projects yet.</div>}
            {client.projects.map((p) => (
              <div className={ui.row} key={p.id}>
                <div>
                  <div className={ui.nm}>{p.title}</div>
                  <div className={ui.meta}>{p.dueLabel ?? p.status.replace("_", " ")}</div>
                </div>
                <span className={ui.meta}>{p.status.replace("_", " ")}</span>
              </div>
            ))}
          </div>
          <div className={ui.panel}>
            <div className={ui.ph}>
              <div className={ui.pt}>Invoices</div>
              <Link className={ui.pl} href="/invoices">All invoices</Link>
            </div>
            {client.invoices.length === 0 && <div className={ui.empty}>No invoices yet.</div>}
            {client.invoices.map((inv) => (
              <div className={ui.row} key={inv.id}>
                <div>
                  <div className={ui.nm}>#{inv.number}</div>
                  <div className={ui.meta}>{money(inv.amountCents)}</div>
                </div>
                <span className={badgeClass(inv.status)}>{inv.status.charAt(0) + inv.status.slice(1).toLowerCase()}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={ui.col}>
          <div className={ui.panel}>
            <div className={ui.ph}>
              <div className={ui.pt}>Files</div>
            </div>
            {client.files.length === 0 && <div className={ui.empty}>No files yet.</div>}
            {client.files.map((f) => (
              <div className={ui.row} key={f.id}>
                <div className={ui.nm}>{f.filename}</div>
                <span className={ui.meta}>{f.sizeLabel}</span>
              </div>
            ))}
          </div>
          <div className={ui.panel}>
            <div className={ui.ph}>
              <div className={ui.pt}>Client portal link</div>
            </div>
            <p className={ui.meta} style={{ lineHeight: 1.6 }}>
              Share this link with {client.contactName.split(" ")[0]} — no login required, it&apos;s unique to {client.name}.
            </p>
            <div className={ui.meta} style={{ wordBreak: "break-all", background: "var(--tag-bg)", padding: 10, borderRadius: 4, marginTop: 8 }}>
              /p/{client.portalToken}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
