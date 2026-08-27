"use client";

import { useActionState } from "react";
import { clientLoginAction } from "./actions";
import { Logo } from "@/components/Logo";
import styles from "../client-auth.module.css";

export default function ClientLoginPage() {
  const [state, formAction, pending] = useActionState(clientLoginAction, undefined);

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <Logo size={32} />
          <div className={styles.name}>VA Hub</div>
        </div>
        <h1 className={styles.h1}>Client sign in</h1>
        <p className={styles.sub}>Track your projects, message your VA, review designs, and pay invoices.</p>
        <form action={formAction} className={styles.form}>
          <label className={styles.label}>
            Email
            <input className={styles.input} type="email" name="email" required autoFocus />
          </label>
          <label className={styles.label}>
            Password
            <input className={styles.input} type="password" name="password" required />
          </label>
          {state?.error && <div className={styles.error}>{state.error}</div>}
          <button className={styles.btn} type="submit" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className={styles.hint}>New here? Use the setup link your VA sent you.</p>
      </div>
    </div>
  );
}
