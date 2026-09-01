"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction } from "./actions";
import { Logo } from "@/components/Logo";
import styles from "../login/login.module.css";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signupAction, undefined);

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <Logo size={32} />
          <div className={styles.name}>VA Hub</div>
        </div>
        <h1 className={styles.h1}>Create your workspace</h1>
        <p className={styles.sub}>A blank slate that&apos;s yours alone — your own clients, projects, and invoices, not the demo data.</p>
        <form action={formAction} className={styles.form}>
          <label className={styles.label}>
            Business / workspace name
            <input className={styles.input} type="text" name="workspaceName" placeholder="e.g. Riverside Virtual Assistants" required autoFocus />
          </label>
          <label className={styles.label}>
            Your name
            <input className={styles.input} type="text" name="name" required />
          </label>
          <label className={styles.label}>
            Email
            <input className={styles.input} type="email" name="email" required />
          </label>
          <label className={styles.label}>
            Password
            <input className={styles.input} type="password" name="password" minLength={8} required />
          </label>
          <label className={styles.label}>
            Confirm password
            <input className={styles.input} type="password" name="confirm" minLength={8} required />
          </label>
          {state?.error && <div className={styles.error}>{state.error}</div>}
          <button className={styles.btn} type="submit" disabled={pending}>
            {pending ? "Creating workspace…" : "Create workspace"}
          </button>
        </form>
        <p className={styles.hint}>
          Already have an account? <Link href="/login">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
