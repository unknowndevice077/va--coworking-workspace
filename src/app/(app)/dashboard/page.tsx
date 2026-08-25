import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { IconPlus, IconCalendar } from "@/components/icons";
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
    PAID: ui.badgePaid,
    PENDING: ui.badgePending,
    OVERDUE: ui.badgeOverdue,
    DRAFT: ui.badgeDraft,
  };
  return `${ui.badge} ${map[status] ?? ""}`;
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const [clientCount, openTasks, invoices, events, clients] = await Promise.all([
    prisma.client.count({ where: { status: { not: "PAUSED" } } }),
    prisma.project.findMany({ where: { status: { not: "DONE" } }, include: { client: true }, orderBy: { createdAt: "asc" }, take: 4 }),
    prisma.invoice.findMany({ include: { client: true }, orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.calendarEvent.findMany({ include: { client: true }, where: { allDay: false }, orderBy: { startHour: "asc" }, take: 3 }),
    prisma.client.findMany({ where: { status: "ACTIVE" }, orderBy: { createdAt: "asc" }, take: 3 }),
  ]);

  const timeAgg = await prisma.timeEntry.aggregate({ _sum: { minutes: true } });
  const hoursLogged = ((timeAgg._sum.minutes ?? 0) / 60).toFixed(1);

  const revenueAgg = await prisma.invoice.aggregate({
    _sum: { amountCents: true },
    where: { status: "PAID" },
  });

  return (
    <div>
      <div className={shell.topline}>
        <h1 className={shell.h1}>
          Good morning, {user?.name.split(" ")[0]}
          <span className={shell.h1sub}>Here&apos;s what&apos;s happening across your clients today</span>
        </h1>
        <Link href="/projects" className={shell.btn}>
          <IconPlus />
          New Task
        </Link>
      </div>

      <div className={ui.stats}>
        <div className={ui.stat}>
          <div className={ui.statLbl}>ACTIVE CLIENTS</div>
          <div className={ui.statVal}>{clientCount}</div>
        </div>
        <div className={ui.stat}>
          <div className={ui.statLbl}>HOURS LOGGED (ALL TIME)</div>
          <div className={ui.statVal}>{hoursLogged}</div>
        </div>
        <div className={ui.stat}>
          <div className={ui.statLbl}>OPEN TASKS</div>
          <div className={ui.statVal}>{openTasks.length}</div>
        </div>
        <div className={ui.stat}>
          <div className={ui.statLbl}>REVENUE (PAID)</div>
          <div className={ui.statVal}>{money(revenueAgg._sum.amountCents ?? 0)}</div>
        </div>
      </div>

      <div className={ui.grid2}>
        <div className={ui.col}>
          <div className={ui.panel}>
            <div className={ui.ph}>
              <div className={ui.pt}>Tasks due</div>
              <Link className={ui.pl} href="/projects">View all</Link>
            </div>
            {openTasks.length === 0 && <div className={ui.empty}>No open tasks — nice work.</div>}
            {openTasks.map((t) => (
              <div className={ui.task} key={t.id}>
                <div className={ui.chk} />
                <div>
                  <div className={ui.tname}>{t.title} — {t.client.name}</div>
                  <div className={ui.twhen}>{t.dueLabel ?? t.status.replace("_", " ")}</div>
                </div>
              </div>
            ))}
          </div>
          <div className={ui.panel}>
            <div className={ui.ph}>
              <div className={ui.pt}>Recent invoices</div>
              <Link className={ui.pl} href="/invoices">View all</Link>
            </div>
            {invoices.map((inv) => (
              <div className={ui.row} key={inv.id}>
                <div className={ui.who2}>
                  <div className={ui.dot}>{initialsOf(inv.client.name)}</div>
                  <div>
                    <div className={ui.nm}>{inv.client.name} · #{inv.number}</div>
                    <div className={ui.meta}>{money(inv.amountCents)}</div>
                  </div>
                </div>
                <span className={badgeClass(inv.status)}>{inv.status.charAt(0) + inv.status.slice(1).toLowerCase()}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={ui.col}>
          <div className={ui.panel}>
            <div className={ui.ph}>
              <div className={ui.pt}>Upcoming calendar</div>
              <Link className={ui.pl} href="/calendar">Open</Link>
            </div>
            {events.length === 0 && <div className={ui.empty}>Nothing scheduled.</div>}
            {events.map((e) => (
              <div className={ui.row} key={e.id}>
                <div className={ui.who2}>
                  <div className={ui.dot}><IconCalendar /></div>
                  <div>
                    <div className={ui.nm}>{e.title}{e.client ? ` — ${e.client.name}` : ""}</div>
                    <div className={ui.meta}>{e.day} · {formatHour(e.startHour)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className={ui.panel}>
            <div className={ui.ph}>
              <div className={ui.pt}>Active clients</div>
              <Link className={ui.pl} href="/clients">Manage</Link>
            </div>
            {clients.map((c) => (
              <div className={ui.row} key={c.id}>
                <div className={ui.who2}>
                  <div className={ui.dot}>{initialsOf(c.name)}</div>
                  <div>
                    <div className={ui.nm}>{c.name}</div>
                    <div className={ui.meta}>{c.services.split(",").join(" & ")}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatHour(h: number) {
  const hour = Math.floor(h);
  const min = h % 1 === 0.5 ? "30" : "00";
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${min} ${period}`;
}
