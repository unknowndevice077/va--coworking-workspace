import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isAiConfigured } from "@/lib/anthropic";
import { GenerateForm } from "./GenerateForm";
import { updateBrandVoiceAction, approveDraftAction, rejectDraftAction } from "./actions";
import shell from "@/components/AppShell.module.css";
import ui from "@/components/ui.module.css";

const STATUS_STYLE: Record<string, { background: string; color: string }> = {
  PENDING: { background: "var(--muted-badge)", color: "var(--sub)" },
  APPROVED: { background: "var(--ok-soft)", color: "var(--ok)" },
  REJECTED: { background: "var(--bad-soft)", color: "var(--bad)" },
};

export default async function CopyChatPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { client: clientId } = await searchParams;

  const clients = await prisma.client.findMany({ where: { workspaceId: user.workspaceId }, orderBy: { name: "asc" } });
  const aiReady = isAiConfigured();

  const selected = clientId ? clients.find((c) => c.id === clientId) : undefined;
  const [brandVoice, drafts] = selected
    ? await Promise.all([
        prisma.brandVoice.findUnique({ where: { clientId: selected.id } }),
        prisma.draft.findMany({ where: { clientId: selected.id }, orderBy: { createdAt: "desc" } }),
      ])
    : [null, []];

  return (
    <div>
      <div className={shell.topline}>
        <h1 className={shell.h1}>
          AI Copy Chat
          <span className={shell.h1sub}>Describe the post, get 3 on-brand caption drafts back — approve or reject each.</span>
        </h1>
      </div>

      {!aiReady && (
        <div className={ui.panel} style={{ borderColor: "var(--accent)", marginBottom: 20 }}>
          <div className={ui.pt} style={{ marginBottom: 6 }}>AI isn&apos;t connected yet</div>
          <p className={ui.meta} style={{ lineHeight: 1.6 }}>
            Add an ANTHROPIC_API_KEY to enable draft generation. The client picker and brand voice notes below still work either way, so you can get everything set up in advance.
          </p>
        </div>
      )}

      <div className={ui.toolbar} style={{ marginBottom: 20 }}>
        {clients.map((c) => (
          <Link
            key={c.id}
            href={`/copy-chat?client=${c.id}`}
            className={`${ui.chip} ${selected?.id === c.id ? ui.chipOn : ""}`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {!selected ? (
        <div className={ui.empty}>Pick a client above to start writing captions for them.</div>
      ) : (
        <div className={ui.grid2}>
          <div className={ui.col}>
            {aiReady && (
              <div className={ui.panel}>
                <div className={ui.ph}>
                  <div className={ui.pt}>Write a caption for {selected.name}</div>
                </div>
                <GenerateForm clientId={selected.id} />
              </div>
            )}
            <div className={ui.panel}>
              <div className={ui.ph}>
                <div className={ui.pt}>Brand voice</div>
              </div>
              <p className={ui.meta} style={{ marginBottom: 10 }}>
                Feeds every draft&apos;s tone automatically — the AI never shows this prompt to you, it just uses it.
              </p>
              <form action={updateBrandVoiceAction}>
                <input type="hidden" name="clientId" value={selected.id} />
                <label className={ui.meta} style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                  Tone notes
                  <textarea
                    name="toneNotes"
                    defaultValue={brandVoice?.toneNotes ?? ""}
                    rows={3}
                    placeholder="e.g. warm, a little playful, never uses exclamation-point spam"
                    style={{ width: "100%", marginTop: 6, padding: 10, border: "1.5px solid var(--border)", borderRadius: 4, fontFamily: "inherit", fontSize: 13, background: "var(--bg)", color: "var(--text)" }}
                  />
                </label>
                <label className={ui.meta} style={{ display: "block", marginBottom: 10, fontWeight: 600 }}>
                  Sample captions (one per line)
                  <textarea
                    name="sampleCaptions"
                    defaultValue={brandVoice?.sampleCaptions ?? ""}
                    rows={4}
                    placeholder={"Monday means fresh croissants and slower mornings.\nBack by popular demand: our fall spice latte is here."}
                    style={{ width: "100%", marginTop: 6, padding: 10, border: "1.5px solid var(--border)", borderRadius: 4, fontFamily: "inherit", fontSize: 13, background: "var(--bg)", color: "var(--text)" }}
                  />
                </label>
                <button className={shell.btnGhost} type="submit">Save brand voice</button>
              </form>
            </div>
          </div>
          <div className={ui.col}>
            <div className={ui.ph} style={{ marginBottom: 10 }}>
              <div className={ui.pt}>Drafts</div>
            </div>
            {drafts.length === 0 && <div className={ui.empty}>No drafts yet for {selected.name}.</div>}
            {drafts.map((d) => (
              <div className={ui.panel} key={d.id} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                  <span className={ui.meta}>{d.prompt}</span>
                  <span className={ui.badge} style={STATUS_STYLE[d.status]}>{d.status.charAt(0) + d.status.slice(1).toLowerCase()}</span>
                </div>
                <p style={{ fontSize: 13.5, lineHeight: 1.6, marginBottom: d.status === "PENDING" ? 10 : 0 }}>{d.content}</p>
                {d.status === "PENDING" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <form action={approveDraftAction}>
                      <input type="hidden" name="id" value={d.id} />
                      <button className={ui.action} type="submit">Approve</button>
                    </form>
                    <form action={rejectDraftAction}>
                      <input type="hidden" name="id" value={d.id} />
                      <button className={ui.action} type="submit">Reject</button>
                    </form>
                  </div>
                )}
                {d.status === "REJECTED" && d.rejectReason && (
                  <p className={ui.meta} style={{ marginTop: 6 }}>Reason: {d.rejectReason}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
