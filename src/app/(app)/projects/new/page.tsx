import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NewProjectForm } from "./NewProjectForm";
import shell from "@/components/AppShell.module.css";

export default async function NewProjectPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const clients = await prisma.client.findMany({ where: { workspaceId: user.workspaceId }, orderBy: { name: "asc" } });

  return (
    <div>
      <div className={shell.topline}>
        <h1 className={shell.h1}>
          New task
          <span className={shell.h1sub}>Add a task to the board</span>
        </h1>
      </div>
      <div style={{ maxWidth: 480 }}>
        <NewProjectForm clients={clients} />
      </div>
    </div>
  );
}
