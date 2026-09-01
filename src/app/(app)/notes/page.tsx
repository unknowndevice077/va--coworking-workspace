import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NoteForm } from "./NoteForm";
import { deleteNoteAction } from "./actions";
import { IconFile, IconSearch, IconTrash } from "@/components/icons";
import { tintStyle, tintDotStyle, initials } from "@/lib/tint";
import shell from "@/components/AppShell.module.css";
import styles from "./notes.module.css";

function timeAgo(date: Date) {
  const mins = Math.round((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string; tag?: string; q?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { client: clientFilter, tag: tagFilter, q = "" } = await searchParams;

  const clients = await prisma.client.findMany({ where: { workspaceId: user.workspaceId }, orderBy: { name: "asc" } });

  const notes = await prisma.note.findMany({
    where: {
      workspaceId: user.workspaceId,
      ...(clientFilter ? { clientId: clientFilter } : {}),
      ...(tagFilter ? { tags: { has: tagFilter } } : {}),
      ...(q ? { body: { contains: q, mode: "insensitive" } } : {}),
    },
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });

  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags))).slice(0, 12);
  const clientCount = new Set(notes.map((n) => n.clientId)).size;

  return (
    <div>
      <div className={shell.topline}>
        <h1 className={shell.h1}>
          Notes
          <span className={shell.h1sub}>Quick capture per client — ideas, feedback, anything worth remembering.</span>
        </h1>
        <div className={styles.countPill}>
          <span className={styles.sw} />
          {notes.length} {notes.length === 1 ? "note" : "notes"}
          {clientCount > 0 && ` across ${clientCount} ${clientCount === 1 ? "client" : "clients"}`}
        </div>
      </div>

      <div className={styles.grid}>
        <div>
          <NoteForm clients={clients.map((c) => ({ id: c.id, name: c.name }))} />
        </div>
        <div>
          <div className={styles.toolbar}>
            <form method="get" className={styles.searchWrap}>
              <IconSearch />
              <input className={styles.searchInput} type="text" name="q" placeholder="Search notes…" defaultValue={q} />
            </form>
            <Link href="/notes" className={`${styles.chip} ${!clientFilter && !tagFilter ? styles.chipOn : ""}`}>
              <span className={styles.sw} style={{ background: !clientFilter && !tagFilter ? "#fff" : "var(--sub)" }} />
              All
            </Link>
            {clients.map((c) => (
              <Link
                key={c.id}
                href={`/notes?client=${c.id}`}
                className={`${styles.chip} ${clientFilter === c.id ? styles.chipOn : ""}`}
              >
                <span className={styles.sw} style={clientFilter === c.id ? { background: "#fff" } : tintDotStyle(c.id)} />
                {c.name}
              </Link>
            ))}
          </div>
          {allTags.length > 0 && (
            <div className={styles.tagsRow}>
              {allTags.map((t) => (
                <Link
                  key={t}
                  href={`/notes?tag=${encodeURIComponent(t)}`}
                  className={styles.tagChip}
                  style={tagFilter === t ? { background: "var(--accent-fill)", color: "#fff" } : tintStyle(t)}
                >
                  {t}
                </Link>
              ))}
            </div>
          )}

          {notes.length === 0 && (
            <div className={styles.empty}>
              <div className={styles.eIcon}><IconFile /></div>
              <div className={styles.eTitle}>No notes yet</div>
              <div className={styles.eSub}>Try a different filter, or add one on the left.</div>
            </div>
          )}
          <div className={styles.notes}>
            {notes.map((n) => (
              <div className={styles.note} key={n.id}>
                <div className={styles.noteHead}>
                  <div className={styles.who}>
                    <div className={styles.avatar} style={tintStyle(n.clientId)}>{initials(n.client.name)}</div>
                    <div>
                      <div className={styles.nm}>{n.client.name}</div>
                      <div className={styles.meta}>{timeAgo(n.createdAt)}</div>
                    </div>
                  </div>
                  <form action={deleteNoteAction}>
                    <input type="hidden" name="id" value={n.id} />
                    <button className={styles.delBtn} type="submit">
                      <IconTrash />
                      Delete
                    </button>
                  </form>
                </div>
                <p className={styles.noteBody}>{n.body}</p>
                {n.imageUrl && (
                  <div className={styles.noteImgWrap}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={n.imageUrl} alt="" />
                  </div>
                )}
                {n.tags.length > 0 && (
                  <div className={styles.tagsRow} style={{ marginBottom: 0, marginTop: 10 }}>
                    {n.tags.map((t) => (
                      <span className={styles.tagChip} key={t} style={tintStyle(t)}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
