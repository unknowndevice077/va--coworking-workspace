import Link from "next/link";
import { prisma } from "@/lib/prisma";
import shell from "@/components/AppShell.module.css";
import ui from "@/components/ui.module.css";

function initialsOf(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export default async function PortalIndexPage() {
  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    include: { designApprovals: { where: { status: "PENDING" } } },
  });

  return (
    <div>
      <div className={shell.topline}>
        <h1 className={shell.h1}>
          Client Portal
          <span className={shell.h1sub}>Every client gets a private, token-based link — no login required for them.</span>
        </h1>
      </div>

      <div className={ui.panelStandalone}>
        {clients.map((c) => (
          <div className={ui.row} key={c.id}>
            <div className={ui.who2}>
              <div className={ui.dot}>{initialsOf(c.name)}</div>
              <div>
                <div className={ui.nm}>{c.name}</div>
                <div className={ui.meta}>
                  {c.designApprovals.length > 0
                    ? `${c.designApprovals.length} design${c.designApprovals.length > 1 ? "s" : ""} awaiting their approval`
                    : "No pending approvals"}
                </div>
              </div>
            </div>
            <Link className={ui.action} href={`/p/${c.portalToken}`} target="_blank">Open portal ↗</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
