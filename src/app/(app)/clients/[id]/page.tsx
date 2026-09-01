import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import shell from "@/components/AppShell.module.css";
import ui from "@/components/ui.module.css";

function badgeClass(status: string) {
  const map: Record<string, string> = {
    ACTIVE: ui.badgeActive,
    ONBOARDING: ui.badgeOnboarding,
    PAUSED: ui.badgePaused,
  };
  return `${ui.badge} ${map[status] ?? ""}`;
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      files: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!client || client.workspaceId !== user.workspaceId) notFound();

  return (
    <div>
      <div className={shell.topline}>
        <h1 className={shell.h1}>
          {client.name}
          <span className={shell.h1sub}>{client.contactName} · {client.contactEmail}</span>
        </h1>
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
          <div className={ui.statVal}>
            ${(client.monthlyValueCents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}
          </div>
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
    </div>
  );
}
