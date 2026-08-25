import { prisma } from "@/lib/prisma";
import { NewProjectForm } from "./NewProjectForm";
import shell from "@/components/AppShell.module.css";

export default async function NewProjectPage() {
  const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });

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
