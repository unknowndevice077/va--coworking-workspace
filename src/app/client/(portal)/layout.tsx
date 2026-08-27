import { redirect } from "next/navigation";
import { getCurrentClient } from "@/lib/client-auth";
import { ClientShell } from "@/components/ClientShell";

export default async function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  const client = await getCurrentClient();
  if (!client) redirect("/client/login");

  return (
    <ClientShell clientName={client.name} contactName={client.contactName}>
      {children}
    </ClientShell>
  );
}
