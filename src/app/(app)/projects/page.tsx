import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { moveProjectAction, logTimeAction } from "./actions";
import { IconPlus, IconClock } from "@/components/icons";
import shell from "@/components/AppShell.module.css";
import styles from "./projects.module.css";

const STAGES = [
  { key: "TODO", label: "To Do" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "REVIEW", label: "Review" },
  { key: "DONE", label: "Done" },
] as const;

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    include: { client: true, timeEntries: true },
    orderBy: { createdAt: "asc" },
  });

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todaysMinutes = await prisma.timeEntry.aggregate({
    _sum: { minutes: true },
    where: { date: { gte: startOfToday } },
  });
  const todayHrs = Math.floor((todaysMinutes._sum.minutes ?? 0) / 60);
  const todayMin = (todaysMinutes._sum.minutes ?? 0) % 60;

  const weekMinutes = await prisma.timeEntry.aggregate({ _sum: { minutes: true } });
  const weekHrs = ((weekMinutes._sum.minutes ?? 0) / 60).toFixed(1);
  const clientCount = new Set(projects.map((p) => p.clientId)).size;

  return (
    <div>
      <div className={shell.topline}>
        <h1 className={shell.h1}>
          Projects
          <span className={shell.h1sub}>{weekHrs} hrs logged across {clientCount} clients</span>
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className={styles.timer}>
            <span className={styles.tlbl}>TODAY</span>
            <span className={styles.tval}>{todayHrs}h {todayMin}m</span>
          </div>
          <Link href="/projects/new" className={shell.btn}>
            <IconPlus />
            New task
          </Link>
        </div>
      </div>

      <div className={styles.board}>
        {STAGES.map((stage) => {
          const items = projects.filter((p) => p.status === stage.key);
          return (
            <div key={stage.key}>
              <div className={styles.colhead}>
                <span className={styles.colname}>{stage.label.toUpperCase()}</span>
                <span className={styles.colcount}>{items.length}</span>
              </div>
              <div className={styles.cards}>
                {items.map((p) => {
                  const minutes = p.timeEntries.reduce((sum, e) => sum + e.minutes, 0);
                  const idx = STAGES.findIndex((s) => s.key === stage.key);
                  return (
                    <div className={styles.card} key={p.id}>
                      <span className={styles.ctag}>{p.client.name}</span>
                      <div className={styles.ctitle}>{p.title}</div>
                      <div className={styles.cfoot}>
                        <span className={styles.cdue}>{p.dueLabel ?? "—"}</span>
                        {minutes > 0 && (
                          <form action={logTimeAction}>
                            <input type="hidden" name="projectId" value={p.id} />
                            <button className={styles.ctime} type="submit" title="Log 15 more minutes">
                              <IconClock />
                              {(minutes / 60).toFixed(1)}h
                            </button>
                          </form>
                        )}
                        {minutes === 0 && (
                          <form action={logTimeAction}>
                            <input type="hidden" name="projectId" value={p.id} />
                            <button className={styles.ctime} type="submit" title="Log 15 minutes">
                              <IconClock />
                              Log time
                            </button>
                          </form>
                        )}
                      </div>
                      <div className={styles.moveRow}>
                        {idx > 0 && (
                          <form action={moveProjectAction} style={{ flex: 1 }}>
                            <input type="hidden" name="projectId" value={p.id} />
                            <input type="hidden" name="direction" value="back" />
                            <button className={styles.moveBtn} type="submit">&lsaquo; {STAGES[idx - 1].label}</button>
                          </form>
                        )}
                        {idx < STAGES.length - 1 && (
                          <form action={moveProjectAction} style={{ flex: 1 }}>
                            <input type="hidden" name="projectId" value={p.id} />
                            <input type="hidden" name="direction" value="forward" />
                            <button className={styles.moveBtn} type="submit">{STAGES[idx + 1].label} &rsaquo;</button>
                          </form>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
