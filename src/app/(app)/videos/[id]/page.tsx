import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { normalizeVideoDoc, blankVideoDoc } from "@/lib/video-doc/types";
import { VideoEditor } from "@/components/video-editor/VideoEditor";

export default async function VideoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const project = await prisma.videoProject.findUnique({ where: { id } });
  if (!project || project.workspaceId !== user.workspaceId) notFound();

  const doc = normalizeVideoDoc(project.doc) ?? blankVideoDoc();

  return <VideoEditor project={{ id: project.id, name: project.name, doc }} />;
}
