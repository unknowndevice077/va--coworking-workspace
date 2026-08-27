"use client";

import { useActionState } from "react";
import { completeClientSetupAction } from "./actions";
import styles from "../../client-auth.module.css";

export function SetupForm({ token, firstName }: { token: string; firstName: string }) {
  const [state, formAction, pending] = useActionState(completeClientSetupAction, undefined);

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="token" value={token} />
      <label className={styles.label}>
        Choose a password
        <input className={styles.input} type="password" name="password" minLength={8} required autoFocus />
      </label>
      <label className={styles.label}>
        Confirm password
        <input className={styles.input} type="password" name="confirm" minLength={8} required />
      </label>
      {state?.error && <div className={styles.error}>{state.error}</div>}
      <button className={styles.btn} type="submit" disabled={pending}>
        {pending ? "Setting up…" : `Finish setup, ${firstName}`}
      </button>
    </form>
  );
}
