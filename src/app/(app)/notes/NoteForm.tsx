"use client";

import { useActionState, useEffect, useRef } from "react";
import { createNoteAction } from "./actions";
import loginStyles from "@/app/login/login.module.css";

export function NoteForm({ clients }: { clients: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createNoteAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.saved) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className={loginStyles.form}>
      <label className={loginStyles.label}>
        Client
        <select className={loginStyles.input} name="clientId" required defaultValue="">
          <option value="" disabled>Pick a client…</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>
      <label className={loginStyles.label}>
        Note
        <textarea className={loginStyles.input} name="body" required rows={3} placeholder="What happened, what they said, an idea for later…" />
      </label>
      <label className={loginStyles.label}>
        Tags (comma separated, optional)
        <input className={loginStyles.input} name="tags" placeholder="brand, feedback, idea" />
      </label>
      <label className={loginStyles.label}>
        Image (optional)
        <input className={loginStyles.input} type="file" name="image" accept="image/*" />
      </label>
      {state?.error && <div className={loginStyles.error}>{state.error}</div>}
      <button className={loginStyles.btn} type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save note"}
      </button>
    </form>
  );
}
