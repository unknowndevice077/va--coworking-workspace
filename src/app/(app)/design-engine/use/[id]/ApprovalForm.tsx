"use client";

import { useActionState } from "react";
import { createApprovalAction } from "../../actions";
import loginStyles from "@/app/login/login.module.css";

export function ApprovalForm({
  clients,
  templateId,
  promptText,
}: {
  clients: { id: string; name: string }[];
  templateId: string;
  promptText: string;
}) {
  const [state, formAction, pending] = useActionState(createApprovalAction, undefined);

  return (
    <form action={formAction} className={loginStyles.form}>
      <input type="hidden" name="templateId" value={templateId} />
      <input type="hidden" name="promptText" value={promptText} />
      <label className={loginStyles.label}>
        Send to client
        <select className={loginStyles.input} name="clientId" required>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>
      <p className={loginStyles.sub} style={{ margin: 0 }}>
        This adds a design awaiting approval to the client&apos;s portal, matched from your prompt: &quot;{promptText || "—"}&quot;
      </p>
      {state?.error && <div className={loginStyles.error}>{state.error}</div>}
      <button className={loginStyles.btn} type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send for approval"}
      </button>
    </form>
  );
}
