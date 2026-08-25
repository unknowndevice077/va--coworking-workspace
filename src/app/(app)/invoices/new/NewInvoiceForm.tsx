"use client";

import { useActionState } from "react";
import { createInvoiceAction } from "../actions";
import loginStyles from "@/app/login/login.module.css";

export function NewInvoiceForm({ clients }: { clients: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createInvoiceAction, undefined);

  return (
    <form action={formAction} className={loginStyles.form}>
      <label className={loginStyles.label}>
        Client
        <select className={loginStyles.input} name="clientId" required>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>
      <label className={loginStyles.label}>
        Amount (USD)
        <input className={loginStyles.input} name="amount" type="number" min="1" step="1" required />
      </label>
      <label className={loginStyles.label}>
        Due date (optional)
        <input className={loginStyles.input} name="dueLabel" placeholder="e.g. Sep 20" />
      </label>
      {state?.error && <div className={loginStyles.error}>{state.error}</div>}
      <button className={loginStyles.btn} type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create invoice"}
      </button>
    </form>
  );
}
