"use client";

import { useActionState } from "react";
import { createClientAction } from "../actions";
import shell from "@/components/AppShell.module.css";
import loginStyles from "@/app/login/login.module.css";

export default function NewClientPage() {
  const [state, formAction, pending] = useActionState(createClientAction, undefined);

  return (
    <div>
      <div className={shell.topline}>
        <h1 className={shell.h1}>
          Add a client
          <span className={shell.h1sub}>Add a new client to your workspace</span>
        </h1>
      </div>
      <div style={{ maxWidth: 480 }}>
        <form action={formAction} className={loginStyles.form}>
          <label className={loginStyles.label}>
            Client name
            <input className={loginStyles.input} name="name" required placeholder="e.g. Brightleaf Studio" />
          </label>
          <label className={loginStyles.label}>
            Contact name
            <input className={loginStyles.input} name="contactName" placeholder="e.g. Elena Cho" />
          </label>
          <label className={loginStyles.label}>
            Contact email
            <input className={loginStyles.input} name="contactEmail" type="email" required placeholder="elena@example.com" />
          </label>
          <label className={loginStyles.label}>
            Services (comma separated)
            <input className={loginStyles.input} name="services" placeholder="Design, Content" />
          </label>
          <label className={loginStyles.label}>
            Monthly value (USD)
            <input className={loginStyles.input} name="monthlyValue" type="number" min="0" step="1" defaultValue="0" />
          </label>
          <label className={loginStyles.label}>
            Status
            <select className={loginStyles.input} name="status" defaultValue="ONBOARDING">
              <option value="ONBOARDING">Onboarding</option>
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
            </select>
          </label>
          {state?.error && <div className={loginStyles.error}>{state.error}</div>}
          <button className={loginStyles.btn} type="submit" disabled={pending}>
            {pending ? "Adding…" : "Add client"}
          </button>
        </form>
      </div>
    </div>
  );
}
