"use client";

import { useActionState } from "react";
import { generateDesignAssistAction } from "./actions";
import { IconSparkle } from "@/components/icons";
import styles from "../design-engine.module.css";

export function AssistForm({ imageGenReady }: { imageGenReady: boolean }) {
  const [state, formAction, pending] = useActionState(generateDesignAssistAction, undefined);

  return (
    <>
      <form action={formAction} className={styles.autoForm}>
        <div className={styles.autoField}>
          <label className={styles.autoLabel} htmlFor="description">Describe the design</label>
          <textarea
            id="description"
            name="description"
            required
            rows={3}
            placeholder='e.g. "A poster for a summer rooftop jazz night, warm sunset colors, elegant serif type"'
          />
        </div>
        <div className={styles.autoRow}>
          <div className={styles.autoField} style={{ flex: 1 }}>
            <label className={styles.autoLabel} htmlFor="width">Width (px)</label>
            <input id="width" type="number" name="width" min={100} max={4000} defaultValue={1080} />
          </div>
          <div className={styles.autoField} style={{ flex: 1 }}>
            <label className={styles.autoLabel} htmlFor="height">Height (px)</label>
            <input id="height" type="number" name="height" min={100} max={4000} defaultValue={1080} />
          </div>
        </div>
        {state?.error && <div style={{ color: "var(--bad)", fontSize: 12.5, marginBottom: 4 }}>{state.error}</div>}
        <button className={styles.gobtn} type="submit" disabled={pending} style={{ alignSelf: "flex-start" }}>
          <IconSparkle />
          {pending ? "Designing…" : imageGenReady ? "Generate design" : "Generate brief"}
        </button>
      </form>

      {state?.brief && (
        <div className={styles.promptPanel} style={{ marginTop: 18 }}>
          <div className={styles.badgeRow}>
            <span className={styles.smartBadge}>
              <IconSparkle />
              {imageGenReady ? "IMAGE GENERATION FAILED — HERE'S THE BRIEF" : "STRUCTURED BRIEF (SHOWCASE — IMAGE RENDERING NOT CONNECTED)"}
            </span>
          </div>
          <div style={{ display: "grid", gap: 10, fontSize: 13, lineHeight: 1.6 }}>
            <div><strong>Layout:</strong> {state.brief.layout}</div>
            <div><strong>Copy:</strong> {state.brief.copy}</div>
            <div><strong>Color direction:</strong> {state.brief.colorDirection}</div>
            <div><strong>Image prompt:</strong> {state.brief.imagePrompt}</div>
          </div>
        </div>
      )}
    </>
  );
}
