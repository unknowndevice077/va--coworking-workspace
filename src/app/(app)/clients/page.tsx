import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { IconPlus } from "@/components/icons";
import shell from "@/components/AppShell.module.css";
import ui from "@/components/ui.module.css";

function initialsOf(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}
function money(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}
function badgeClass(status: string) {
  const map: Record<string, string> = {
    ACTIVE: ui.badgeActive,
    ONBOARDING: ui.badgeOnboarding,
    PAUSED: ui.badgePaused,
  };
  return `${ui.badge} ${map[status] ?? ""}`;
}

const STATUSES = ["All", "ACTIVE", "ONBOARDING", "PAUSED"] as const;

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status = "All", q = "" } = await searchParams;

  const clients = await prisma.client.findMany({
    where: {
      ...(status !== "All" ? { status } : {}),
      ...(q ? { name: { contains: q } } : {}),
    },
    orderBy: { createdAt: "asc" },
  });

  const counts = await prisma.client.groupBy({ by: ["status"], _count: true });
  const countOf = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;

  return (
    <div>
      <div className={shell.topline}>
        <h1 className={shell.h1}>
          Clients
          <span className={shell.h1sub}>
            {countOf("ACTIVE")} active · {countOf("ONBOARDING")} onboarding · {countOf("PAUSED")} paused
          </span>
        </h1>
        <Link href="/clients/new" className={shell.btn}>
          <IconPlus />
          Add Client
        </Link>
      </div>

      <div className={ui.toolbar}>
        <form method="get">
          <input className={ui.search} type="text" name="q" placeholder="Search clients..." defaultValue={q} />
        </form>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={s === "All" ? "/clients" : `/clients?status=${s}`}
            className={`${ui.chip} ${status === s ? ui.chipOn : ""}`}
          >
            {s === "All" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
          </Link>
        ))}
      </div>

      <table className={ui.table}>
        <thead>
          <tr>
            <th>Client</th>
            <th>Contact</th>
            <th>Services</th>
            <th>Status</th>
            <th>Monthly Value</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {clients.length === 0 && (
            <tr>
              <td colSpan={6} className={ui.empty}>
                No clients match.
              </td>
            </tr>
          )}
          {clients.map((c) => (
            <tr key={c.id}>
              <td>
                <div className={ui.who2}>
                  <div className={ui.dot}>{initialsOf(c.name)}</div>
                  <div>
                    <div className={ui.nm}>{c.name}</div>
                  </div>
                </div>
              </td>
              <td>
                <div className={ui.nm}>{c.contactName}</div>
                <div className={ui.meta}>{c.contactEmail}</div>
              </td>
              <td>
                <div className={ui.tags}>
                  {c.services.split(",").map((s) => (
                    <span className={ui.tag} key={s}>{s}</span>
                  ))}
                </div>
              </td>
              <td>
                <span className={badgeClass(c.status)}>{c.status.charAt(0) + c.status.slice(1).toLowerCase()}</span>
              </td>
              <td>
                <div className={ui.nm}>{money(c.monthlyValueCents)}</div>
              </td>
              <td>
                <Link className={ui.action} href={`/clients/${c.id}`}>Open →</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
