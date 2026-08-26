import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isValidDoc, type CanvasDoc } from "@/lib/canvas-doc/types";
import { blankDoc } from "@/lib/canvas-doc/presets";
import { CanvasEditor } from "@/components/canvas-editor/CanvasEditor";

export default async function DesignStudioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const design = await prisma.design.findUnique({
    where: { id },
    include: { approvals: { include: { client: true }, orderBy: { createdAt: "desc" } } },
  });
  if (!design) notFound();

  const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });
  // A design saved before this shape existed, or with corrupted content —
  // open it as a blank canvas rather than crashing the page.
  const doc: CanvasDoc = isValidDoc(design.doc) ? design.doc : blankDoc("Social Post");

  return (
    <CanvasEditor
      design={{
        id: design.id,
        name: design.name,
        doc,
        status: design.status,
      }}
      clients={clients}
      approvals={design.approvals.map((a) => ({ id: a.id, status: a.status, clientName: a.client.name }))}
    />
  );
}
