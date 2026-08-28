import { redirect } from "next/navigation";
import { getCurrentClient } from "@/lib/client-auth";
import { prisma } from "@/lib/prisma";
import { sendClientMessageAction } from "./actions";
import styles from "../portal.module.css";

export default async function ClientInboxPage() {
  const session = await getCurrentClient();
  if (!session) redirect("/client/login");

  const thread = await prisma.messageThread.upsert({
    where: { clientId: session.id },
    create: { workspaceId: session.workspaceId, clientId: session.id },
    update: {},
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  return (
    <div className={styles.main} style={{ gridTemplateColumns: "1fr", maxWidth: 640 }}>
      <div className={styles.panel}>
        <div className={styles.pt}>Messages with your VA</div>
        <div className={styles.msgs}>
          {thread.messages.length === 0 && <div className={styles.empty}>No messages yet — say hello!</div>}
          {thread.messages.map((m) => (
            <div className={`${styles.msg} ${m.fromVA ? styles.msgIn : styles.msgOut}`} key={m.id}>
              {m.body}
              <div className={styles.mtime}>{m.createdAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</div>
            </div>
          ))}
        </div>
        <form action={sendClientMessageAction} className={styles.composer}>
          <input type="hidden" name="threadId" value={thread.id} />
          <input type="text" name="body" placeholder="Write a message…" autoComplete="off" />
          <button className={styles.sendbtn} type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}
