import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { designTemplates } from "@/lib/design-templates";
import { guessHeadline } from "@/lib/match-template";
import { ApprovalForm } from "./ApprovalForm";
import shell from "@/components/AppShell.module.css";
import styles from "../../design-engine.module.css";

export default async function UseTemplatePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { id } = await params;
  const { q = "" } = await searchParams;
  const template = designTemplates.find((t) => t.id === id);
  if (!template) notFound();

  const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });
  const headline = guessHeadline(q);

  return (
    <div>
      <div className={shell.topline}>
        <h1 className={shell.h1}>
          {template.name}
          <span className={shell.h1sub}>{template.category} · from the Smart Templates library</span>
        </h1>
      </div>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div
          className={styles.thumb}
          style={{
            width: 260,
            height: 200,
            borderRadius: 8,
            background: `oklch(0.92 0.045 ${template.hue})`,
            flexDirection: "column",
            gap: 10,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke={`oklch(0.5 0.14 ${template.hue})`}
            strokeWidth={1.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: 48, height: 48 }}
          >
            <path d={template.iconPath} />
          </svg>
          <div style={{ fontSize: 12, fontWeight: 700, color: `oklch(0.4 0.12 ${template.hue})`, textAlign: "center", padding: "0 16px" }}>
            {headline}
          </div>
        </div>

        <div style={{ minWidth: 280, maxWidth: 420, flex: 1 }}>
          <ApprovalForm clients={clients} templateId={template.id} promptText={q} />
        </div>
      </div>
    </div>
  );
}
