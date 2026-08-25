import { prisma } from "@/lib/prisma";
import { NewInvoiceForm } from "./NewInvoiceForm";
import shell from "@/components/AppShell.module.css";

export default async function NewInvoicePage() {
  const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <div className={shell.topline}>
        <h1 className={shell.h1}>
          New invoice
          <span className={shell.h1sub}>Create a draft invoice</span>
        </h1>
      </div>
      <div style={{ maxWidth: 480 }}>
        <NewInvoiceForm clients={clients} />
      </div>
    </div>
  );
}
