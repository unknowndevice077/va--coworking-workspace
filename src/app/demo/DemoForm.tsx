"use client";

import { useActionState } from "react";
import { startDemoAction } from "./actions";
import { IconSparkle } from "@/components/icons";
import styles from "./demo.module.css";

export function DemoForm({ categories }: { categories: readonly string[] }) {
  const [state, formAction, pending] = useActionState(startDemoAction, undefined);

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="promptText">What do you need designed?</label>
        <textarea
          id="promptText"
          name="promptText"
          required
          rows={3}
          placeholder='e.g. "Instagram post announcing our fall bakery menu" or "Logo for a law firm"'
        />
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="category">Category (optional)</label>
          <select id="category" name="category" defaultValue="All">
            <option value="All">Best match, any category</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="logo">Your logo (optional)</label>
          <input id="logo" type="file" name="logo" accept="image/*" />
        </div>
      </div>
      {state?.error && <div className={styles.error}>{state.error}</div>}
      <button className={styles.btn} type="submit" disabled={pending}>
        <IconSparkle />
        {pending ? "Handing this to your VA…" : "Send to my VA"}
      </button>
    </form>
  );
}
