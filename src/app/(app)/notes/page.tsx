import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NoteForm } from "./NoteForm";
import { deleteNoteAction } from "./actions";
import { IconFile } from "@/components/icons";
import shell from "@/components/AppShell.module.css";
import ui from "@/components/ui.module.css";

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

  return (
    <div>
      <div className={shell.topline}>
        <h1 className={shell.h1}>
          Notes
          <span className={shell.h1sub}>Quick capture per client — ideas, feedback, anything worth remembering.</span>
        </h1>
      </div>

      <div className={ui.grid2}>
        <div className={ui.col}>
          <div className={ui.panel}>
            <div className={ui.ph}>
              <div className={ui.pt}>New note</div>
            </div>
            <NoteForm clients={clients.map((c) => ({ id: c.id, name: c.name }))} />
          </div>
        </div>
        <div className={ui.col}>
          <div className={ui.toolbar}>
            <form method="get">
              <input className={ui.search} type="text" name="q" placeholder="Search notes…" defaultValue={q} />
            </form>
            <Link href="/notes" className={`${ui.chip} ${!clientFilter && !tagFilter ? ui.chipOn : ""}`}>All</Link>
            {clients.map((c) => (
              <Link
                key={c.id}
                href={`/notes?client=${c.id}`}
                className={`${ui.chip} ${clientFilter === c.id ? ui.chipOn : ""}`}
              >
                {c.name}
              </Link>
            ))}
          </div>
          {allTags.length > 0 && (
            <div className={ui.tags} style={{ marginBottom: 14 }}>
              {allTags.map((t) => (
                <Link key={t} href={`/notes?tag=${encodeURIComponent(t)}`} className={ui.tag} style={tagFilter === t ? { background: "var(--accent-fill)", color: "#fff" } : undefined}>
                  {t}
                </Link>
              ))}
            </div>
          )}

          {notes.length === 0 && <div className={ui.empty}>No notes match — try a different filter, or add one on the left.</div>}
          {notes.map((n) => (
            <div className={ui.panel} key={n.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                <div>
                  <div className={ui.nm}>{n.client.name}</div>
                  <div className={ui.meta}>{timeAgo(n.createdAt)}</div>
                </div>
                <form action={deleteNoteAction}>
                  <input type="hidden" name="id" value={n.id} />
                  <button className={ui.action} type="submit">Delete</button>
                </form>
              </div>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, marginBottom: n.tags.length || n.imageUrl ? 10 : 0 }}>{n.body}</p>
              {n.imageUrl && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: n.tags.length ? 10 : 0 }}>
                  <div className={ui.dot}><IconFile /></div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={n.imageUrl} alt="" style={{ maxWidth: 160, maxHeight: 120, borderRadius: 6, border: "1px solid var(--border)" }} />
                </div>
              )}
              {n.tags.length > 0 && (
                <div className={ui.tags}>
                  {n.tags.map((t) => (
                    <span className={ui.tag} key={t}>{t}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
