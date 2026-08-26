import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { normalizeVideoDoc, blankVideoDoc } from "@/lib/video-doc/types";
import { VideoEditor } from "@/components/video-editor/VideoEditor";

export default async function VideoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const project = await prisma.videoProject.findUnique({ where: { id } });
  if (!project) notFound();

  const doc = normalizeVideoDoc(project.doc) ?? blankVideoDoc();

  return <VideoEditor project={{ id: project.id, name: project.name, doc }} />;
}
