import { Fragment } from "react";
import { prisma } from "@/lib/prisma";
import { IconPlus } from "@/components/icons";
import shell from "@/components/AppShell.module.css";
import styles from "./calendar.module.css";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI"] as const;
const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];

function hourLabel(h: number) {
  const period = h >= 12 ? "PM" : "AM";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display} ${period}`;
}
function timeRangeLabel(start: number, end: number) {
  const fmt = (h: number) => {
    const period = h >= 12 ? "p" : "a";
    const hour = Math.floor(h);
    const min = h % 1 === 0.5 ? ":30" : "";
    const display = hour % 12 === 0 ? 12 : hour % 12;
    return `${display}${min}${period}`;
  };
  return `${fmt(start)}–${fmt(end)}`;
}

export default async function CalendarPage() {
  const events = await prisma.calendarEvent.findMany({ include: { client: true } });

  return (
    <div>
      <div className={shell.topline}>
        <h1 className={shell.h1}>
          Calendar
          <span className={shell.h1sub}>This week</span>
        </h1>
        <button className={shell.btn} type="button">
          <IconPlus />
          New Event
        </button>
      </div>

      <div className={styles.calWrap}>
      <div className={styles.cal}>
        <div className={styles.cell} />
        {DAYS.map((d) => (
          <div className={styles.dayhead} key={d}>{d}</div>
        ))}

        <div className={styles.cell} />
        {DAYS.map((d) => {
          const allDayEvents = events.filter((e) => e.day === d && e.allDay);
          return (
            <div className={`${styles.cell} ${styles.allday}`} key={d}>
              {allDayEvents.map((e) => (
                <span className={styles.chip} key={e.id}>
                  {e.title}{e.client ? ` — ${e.client.name}` : ""}
                </span>
              ))}
            </div>
          );
        })}

        {HOURS.map((h) => (
          <Fragment key={h}>
            <div className={styles.timelbl}>{hourLabel(h)}</div>
            {DAYS.map((d) => {
              const evt = events.find((e) => !e.allDay && e.day === d && Math.floor(e.startHour) === h);
              return (
                <div className={styles.cell} key={`${d}-${h}`}>
                  {evt && (
                    <div className={styles.evt}>
                      <div className={styles.et}>{evt.title}</div>
                      <div className={styles.es}>
                        {evt.client ? `${evt.client.name} · ` : ""}
                        {timeRangeLabel(evt.startHour, evt.endHour)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
      </div>
    </div>
  );
}
