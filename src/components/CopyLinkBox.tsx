"use client";

import { useState } from "react";
import styles from "./CopyLinkBox.module.css";

export function CopyLinkBox({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable (e.g. non-HTTPS/localhost edge cases) —
      // the link is still fully selectable text, so nothing is lost.
    }
  }

  return (
    <div className={styles.row}>
      <div className={styles.box}>{value}</div>
      <button type="button" className={styles.btn} onClick={copy}>
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
