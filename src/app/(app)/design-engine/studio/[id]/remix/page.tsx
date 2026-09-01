import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { normalizeDoc } from "@/lib/canvas-doc/types";
import { DocSurface } from "@/lib/canvas-doc/render";
import { ScaledCanvas } from "@/components/graphic/ScaledCanvas";
import { REMIX_STYLES, remixFixed } from "@/lib/remix";
import { isImageGenConfigured } from "@/lib/image-gen";
import { applyFixedRemixAction, generateAiRemixAction } from "./actions";
import shell from "@/components/AppShell.module.css";
import styles from "../../../design-engine.module.css";

export default async function RemixPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const design = await prisma.design.findUnique({ where: { id } });
  if (!design || design.workspaceId !== user.workspaceId) notFound();
  const doc = normalizeDoc(design.doc);
  if (!doc) notFound();

  return (
    <div>
      <div className={shell.topline}>
        <h1 className={shell.h1}>
          Remix: {design.name}
          <span className={shell.h1sub}>3 style variations from the same content — pick one to open as a new draft.</span>
        </h1>
        <Link href={`/design-engine/studio/${design.id}`} className={shell.btnGhost}>← Back to design</Link>
      </div>

      <div className={styles.results}>
        {REMIX_STYLES.map((style) => {
          const variantDoc = remixFixed(doc, style.id);
          return (
            <div className={styles.tcard} key={style.id}>
              <div className={styles.thumb}>
                <ScaledCanvas width={variantDoc.width} height={variantDoc.height}>
                  <DocSurface doc={variantDoc} />
                </ScaledCanvas>
              </div>
              <div className={styles.tbody}>
                <div className={styles.tname}>{style.label}</div>
                <div className={styles.tmeta}>
                  <span className={styles.tcat}>{style.description}</span>
                  <form action={applyFixedRemixAction}>
                    <input type="hidden" name="designId" value={design.id} />
                    <input type="hidden" name="styleId" value={style.id} />
                    <button className={styles.use} type="submit">Use this →</button>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.promptPanel} style={{ marginTop: 8 }}>
        <div className={styles.badgeRow}>
          <span className={styles.smartBadge}>AI VARIATIONS</span>
        </div>
        {isImageGenConfigured() ? (
          <>
            <form action={generateAiRemixAction} className={styles.promptbox}>
              <input type="hidden" name="designId" value={design.id} />
              <input type="text" name="prompt" defaultValue={design.promptText} placeholder="Describe the design for AI-generated variations…" />
              <button className={styles.gobtn} type="submit">Generate 3 AI variations</button>
            </form>
            <div className={styles.trynote}>
              Renders 3 genuinely new images (clean/modern, bold/colorful, elegant/minimal) and drops them into My Designs as drafts — takes a few seconds.
            </div>
          </>
        ) : (
          <div className={styles.trynote}>
            AI-generated variations aren&apos;t connected yet — add an OPENAI_API_KEY to unlock this. The 3 fixed styles above work right now, no setup needed.
          </div>
        )}
      </div>
    </div>
  );
}
