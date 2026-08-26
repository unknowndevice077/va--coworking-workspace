import Link from "next/link";
import { templateCategories } from "@/lib/canvas-doc/presets";
import { IconSparkle } from "@/components/icons";
import { autoDesignAction } from "../actions";
import shell from "@/components/AppShell.module.css";
import styles from "../design-engine.module.css";

// One-step design: describe it, optionally drop in a logo, and it lands
// you straight in a filled-out draft — the best-matching template, with
// your logo in its brand-mark slot and your prompt reflected in the
// headline. Smart matching + placement, not generative AI: nothing here
// invents an image or copy, it only places what already exists.
export default function AutoDesignPage() {
  return (
    <div>
      <div className={shell.topline}>
        <h1 className={shell.h1}>
          Auto Design
          <span className={shell.h1sub}>Describe it, add your logo, and land in a filled-out draft — ready to edit, not a blank canvas.</span>
        </h1>
        <Link href="/design-engine" className={shell.btnGhost}>Browse templates →</Link>
      </div>

      <form action={autoDesignAction} className={styles.autoForm}>
        <div className={styles.autoField}>
          <label className={styles.autoLabel} htmlFor="promptText">What are you designing?</label>
          <textarea
            id="promptText"
            name="promptText"
            required
            rows={3}
            placeholder='e.g. "Just listed pubmat for a 4 bed 2.5 bath home in Canton" or "Monday motivation quote for real estate"'
          />
        </div>

        <div className={styles.autoRow}>
          <div className={styles.autoField} style={{ flex: 1 }}>
            <label className={styles.autoLabel} htmlFor="category">Category (optional)</label>
            <select id="category" name="category" defaultValue="All">
              <option value="All">Best match, any category</option>
              {templateCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className={styles.autoField} style={{ flex: 1 }}>
            <label className={styles.autoLabel} htmlFor="logo">Your logo (optional)</label>
            <input id="logo" type="file" name="logo" accept="image/*" />
          </div>
        </div>

        <button className={shell.btn} type="submit">
          <IconSparkle />
          Auto-design it
        </button>
        <p className={styles.autoHint}>
          We match the best-fitting template to what you typed, drop your logo into its brand mark (or a corner badge if it doesn&apos;t have one),
          and prefill the headline — then you land right in the editor to finish it your way.
        </p>
      </form>
    </div>
  );
}
