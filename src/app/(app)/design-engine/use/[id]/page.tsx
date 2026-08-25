import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { designTemplates } from "@/lib/design-templates";
import { guessHeadline } from "@/lib/match-template";
import { TemplateThumb } from "@/components/TemplateThumb";
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
  // When the VA typed a prompt, reflect it in the preview headline so the
  // page reads as "here's what your request produced," not just the
  // template's generic sample — everything else about the template stays
  // the same real, pre-built layout.
  const previewTemplate = q.trim() ? { ...template, headline: guessHeadline(q) } : template;

  return (
    <div>
      <div className={shell.topline}>
        <h1 className={shell.h1}>
          {template.name}
          <span className={shell.h1sub}>{template.category} · from the Smart Templates library</span>
        </h1>
      </div>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className={styles.thumb} style={{ width: 260, height: 200, borderRadius: 8 }}>
          <TemplateThumb template={previewTemplate} variant="hero" />
        </div>

        <div style={{ minWidth: 280, maxWidth: 420, flex: 1 }}>
          <ApprovalForm clients={clients} templateId={template.id} promptText={q} />
        </div>
      </div>
    </div>
  );
}
