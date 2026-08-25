import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { designTemplates } from "@/lib/design-templates";
import { StudioEditor } from "./StudioEditor";

export default async function DesignStudioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const design = await prisma.design.findUnique({
    where: { id },
    include: { approvals: { include: { client: true }, orderBy: { createdAt: "desc" } } },
  });
  if (!design) notFound();

  const template = designTemplates.find((t) => t.id === design.templateId);
  if (!template) notFound();

  const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });

  return (
    <StudioEditor
      design={{
        id: design.id,
        name: design.name,
        headline: design.headline,
        sub: design.sub,
        tag: design.tag,
        hue: design.hue,
        status: design.status,
      }}
      template={template}
      clients={clients}
      approvals={design.approvals.map((a) => ({ id: a.id, status: a.status, clientName: a.client.name }))}
    />
  );
}
