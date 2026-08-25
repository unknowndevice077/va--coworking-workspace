"use client";

import { useActionState } from "react";
import { createProjectAction } from "../actions";
import loginStyles from "@/app/login/login.module.css";

export function NewProjectForm({ clients }: { clients: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createProjectAction, undefined);

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
        Task title
        <input className={loginStyles.input} name="title" required placeholder="e.g. Draft social calendar" />
      </label>
      <label className={loginStyles.label}>
        Due label (optional)
        <input className={loginStyles.input} name="dueLabel" placeholder="e.g. Due Friday" />
      </label>
      {state?.error && <div className={loginStyles.error}>{state.error}</div>}
      <button className={loginStyles.btn} type="submit" disabled={pending}>
        {pending ? "Adding…" : "Add task"}
      </button>
    </form>
  );
}
