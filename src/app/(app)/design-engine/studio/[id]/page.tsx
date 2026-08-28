import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { normalizeDoc, type CanvasDoc } from "@/lib/canvas-doc/types";
import { blankDoc } from "@/lib/canvas-doc/presets";
import { CanvasEditor } from "@/components/canvas-editor/CanvasEditor";

export default async function DesignStudioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const design = await prisma.design.findUnique({
    where: { id },
    include: { approvals: true },
  });
  if (!design || design.workspaceId !== user.workspaceId) notFound();

  // A design saved before this shape existed, or with corrupted content —
  // open it as a blank canvas rather than crashing the page.
  const doc: CanvasDoc = normalizeDoc(design.doc) ?? blankDoc("Social Post");

  return (
    <CanvasEditor
      design={{
        id: design.id,
        name: design.name,
        doc,
        status: design.status,
      }}
      sentCount={design.approvals.length}
    />
  );
}
