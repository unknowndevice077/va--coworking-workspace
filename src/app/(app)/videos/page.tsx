import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { normalizeVideoDoc, totalDuration } from "@/lib/video-doc/types";
import { createVideoProjectAction } from "./actions";
import { IconPlus } from "@/components/icons";
import shell from "@/components/AppShell.module.css";
import styles from "./videos.module.css";

function fmtDuration(seconds: number) {
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export default async function VideosPage() {
  const projects = await prisma.videoProject.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div>
      <div className={shell.topline}>
        <h1 className={shell.h1}>
          Video Studio
          <span className={shell.h1sub}>Sequence clips, add text overlays, export a real video file — reels, stories, quick promos.</span>
        </h1>
      </div>

      <div className={styles.startRow}>
        <form action={createVideoProjectAction}>
          <input type="hidden" name="orientation" value="portrait" />
          <button className={shell.btn} type="submit">
            <IconPlus />
            New vertical video (9:16)
          </button>
        </form>
        <form action={createVideoProjectAction}>
          <input type="hidden" name="orientation" value="square" />
          <button className={shell.btnGhost} type="submit">Square (1:1)</button>
        </form>
        <form action={createVideoProjectAction}>
          <input type="hidden" name="orientation" value="landscape" />
          <button className={shell.btnGhost} type="submit">Landscape (16:9)</button>
        </form>
      </div>

      {projects.length === 0 ? (
        <div className={styles.empty}>No video projects yet — start one above.</div>
      ) : (
        <div className={styles.grid}>
          {projects.map((v) => {
            const doc = normalizeVideoDoc(v.doc);
            if (!doc) return null;
            return (
              <Link href={`/videos/${v.id}`} key={v.id} className={styles.card} style={{ aspectRatio: doc.width > doc.height ? "16/9" : doc.width === doc.height ? "1/1" : "9/16" }}>
                <div className={styles.cardMeta}>
                  <div className={styles.cardName}>{v.name}</div>
                  <div className={styles.cardSub}>
                    {doc.clips.length} clip{doc.clips.length === 1 ? "" : "s"} · {fmtDuration(totalDuration(doc))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
