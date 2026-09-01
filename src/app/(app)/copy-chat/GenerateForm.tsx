"use client";

import { useActionState } from "react";
import { generateDraftsAction } from "./actions";
import loginStyles from "@/app/login/login.module.css";

export function GenerateForm({ clientId }: { clientId: string }) {
  const [state, formAction, pending] = useActionState(generateDraftsAction, undefined);

  return (
    <form action={formAction} className={loginStyles.form}>
      <input type="hidden" name="clientId" value={clientId} />
      <label className={loginStyles.label}>
        What&apos;s this post about?
        <textarea className={loginStyles.input} name="topic" required rows={2} placeholder='e.g. "announcing our fall menu launch this weekend"' />
      </label>
      <label className={loginStyles.label}>
        Platform (optional)
        <select className={loginStyles.input} name="platform" defaultValue="">
          <option value="">Any</option>
          <option value="Instagram">Instagram</option>
          <option value="Facebook">Facebook</option>
          <option value="LinkedIn">LinkedIn</option>
          <option value="X / Twitter">X / Twitter</option>
        </select>
      </label>
      {state?.error && <div className={loginStyles.error}>{state.error}</div>}
      <button className={loginStyles.btn} type="submit" disabled={pending}>
        {pending ? "Writing…" : "Generate 3 drafts"}
      </button>
    </form>
  );
}
