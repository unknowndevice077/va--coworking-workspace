import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendMessageAction } from "./actions";
import styles from "./inbox.module.css";

function initialsOf(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}
function timeAgo(date: Date) {
  const mins = Math.round((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.round(hrs / 24)}d`;
}

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ thread?: string }>;
}) {
  const { thread: threadParam } = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const threads = await prisma.messageThread.findMany({
    where: { workspaceId: user.workspaceId },
    include: { client: true, messages: { orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: { updatedAt: "desc" },
  });

  const activeId = threadParam ?? threads[0]?.id;
  const activeCandidate = activeId
    ? await prisma.messageThread.findUnique({
        where: { id: activeId },
        include: { client: true, messages: { orderBy: { createdAt: "asc" } } },
      })
    : null;
  const active = activeCandidate?.workspaceId === user.workspaceId ? activeCandidate : null;

  return (
    <div className={styles.shell2}>
      <div className={styles.threads}>
        <div className={styles.thh}>Inbox</div>
        {threads.map((t) => {
          const last = t.messages[0];
          const isOn = t.id === activeId;
          return (
            <a href={`/inbox?thread=${t.id}`} key={t.id} className={`${styles.thread} ${isOn ? styles.threadOn : ""}`}>
              <div className={styles.dot}>{initialsOf(t.client.name)}</div>
              <div className={styles.tinfo}>
                <div className={styles.trow}>
                  <span className={styles.tname}>{t.client.name}</span>
                  {last && <span className={styles.ttime}>{timeAgo(last.createdAt)}</span>}
                </div>
                {last && <div className={styles.tsnip}>{last.body}</div>}
              </div>
            </a>
          );
        })}
      </div>
      <div className={styles.thpane}>
        {active ? (
          <>
            <div className={styles.hd}>
              <div className={styles.dot} style={{ width: 36, height: 36 }}>{initialsOf(active.client.name)}</div>
              <div>
                <div className={styles.hdnm}>{active.client.name}</div>
                <div className={styles.hdrole}>{active.client.contactName}</div>
              </div>
            </div>
            <div className={styles.msgs}>
              {active.messages.map((m) => (
                <div className={`${styles.msg} ${m.fromVA ? styles.msgOut : styles.msgIn}`} key={m.id}>
                  {m.body}
                  <div className={styles.mtime}>{m.createdAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</div>
                </div>
              ))}
            </div>
            <form action={sendMessageAction} className={styles.composer}>
              <input type="hidden" name="threadId" value={active.id} />
              <input type="text" name="body" placeholder="Write a reply..." autoComplete="off" />
              <button className={styles.sendbtn} type="submit">Send</button>
            </form>
          </>
        ) : (
          <div style={{ padding: 40, color: "var(--sub)" }}>No conversations yet.</div>
        )}
      </div>
    </div>
  );
}
