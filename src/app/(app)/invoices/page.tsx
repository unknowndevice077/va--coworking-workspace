import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { markPaidAction } from "./actions";
import { IconPlus } from "@/components/icons";
import shell from "@/components/AppShell.module.css";
import ui from "@/components/ui.module.css";

function money(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}
function badgeClass(status: string) {
  const map: Record<string, string> = {
    PAID: ui.badgePaid,
    PENDING: ui.badgePending,
    OVERDUE: ui.badgeOverdue,
    DRAFT: ui.badgeDraft,
  };
  return `${ui.badge} ${map[status] ?? ""}`;
}

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    include: { client: true },
    orderBy: { number: "desc" },
  });

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const outstanding = invoices
    .filter((i) => i.status === "PENDING" || i.status === "OVERDUE")
    .reduce((sum, i) => sum + i.amountCents, 0);
  const paidThisMonth = invoices
    .filter((i) => i.status === "PAID" && i.createdAt >= startOfMonth)
    .reduce((sum, i) => sum + i.amountCents, 0);
  const overdue = invoices.filter((i) => i.status === "OVERDUE").reduce((sum, i) => sum + i.amountCents, 0);

  return (
    <div>
      <div className={shell.topline}>
        <h1 className={shell.h1}>
          Invoices
          <span className={shell.h1sub}>{invoices.length} invoices total</span>
        </h1>
        <Link href="/invoices/new" className={shell.btn}>
          <IconPlus />
          New Invoice
        </Link>
      </div>

      <div className={`${ui.statsThree} staggerChildren`}>
        <div className={ui.stat}>
          <div className={ui.statLbl}>OUTSTANDING</div>
          <div className={ui.statVal}>{money(outstanding)}</div>
        </div>
        <div className={ui.stat}>
          <div className={ui.statLbl}>PAID THIS MONTH</div>
          <div className={ui.statVal}>{money(paidThisMonth)}</div>
        </div>
        <div className={ui.stat}>
          <div className={ui.statLbl}>OVERDUE</div>
          <div className={ui.statVal} style={{ color: "var(--bad)" }}>{money(overdue)}</div>
        </div>
      </div>

      <div className={ui.tableWrap}>
      <table className={ui.table}>
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Client</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Due date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td className={ui.num}>#{inv.number}</td>
              <td>{inv.client.name}</td>
              <td className={ui.num}>{money(inv.amountCents)}</td>
              <td><span className={badgeClass(inv.status)}>{inv.status.charAt(0) + inv.status.slice(1).toLowerCase()}</span></td>
              <td>{inv.dueLabel ?? "—"}</td>
              <td>
                {inv.status !== "PAID" && (
                  <form action={markPaidAction}>
                    <input type="hidden" name="invoiceId" value={inv.id} />
                    <button className={ui.action} type="submit">Mark paid</button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
