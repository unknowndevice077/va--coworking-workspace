"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "./actions";
import { Logo } from "@/components/Logo";
import styles from "./login.module.css";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <Logo size={32} />
          <div className={styles.name}>VA Hub</div>
        </div>
        <h1 className={styles.h1}>Sign in</h1>
        <p className={styles.sub}>Your all-in-one workspace for clients, projects, and more.</p>
        <form action={formAction} className={styles.form}>
          <label className={styles.label}>
            Email
            <input className={styles.input} type="email" name="email" defaultValue="jamie@vahub.app" required />
          </label>
          <label className={styles.label}>
            Password
            <input className={styles.input} type="password" name="password" defaultValue="password123" required />
          </label>
          {state?.error && <div className={styles.error}>{state.error}</div>}
          <button className={styles.btn} type="submit" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className={styles.hint}>Demo account is pre-filled — just hit sign in.</p>
        <p className={styles.hint}>
          New here? <Link href="/signup">Create your own workspace →</Link>
        </p>
      </div>
    </div>
  );
}
