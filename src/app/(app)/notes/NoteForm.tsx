"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createNoteAction } from "./actions";
import { IconPlus, IconUpload, IconCheck } from "@/components/icons";
import { tintStyle } from "@/lib/tint";
import styles from "./notes.module.css";

export function NoteForm({ clients }: { clients: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createNoteAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [tagsRaw, setTagsRaw] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Reset the controlled bits of the form once a save completes. Comparing
  // against a "last handled state" piece of state lets this run during
  // render (React's recommended way to reset state in response to a
  // change) instead of in an effect, since the effect below already owns
  // the one true side effect here (clearing the uncontrolled fields via
  // formRef).
  const [lastHandled, setLastHandled] = useState(state);
  if (state !== lastHandled) {
    setLastHandled(state);
    if (state?.saved) {
      setTagsRaw("");
      setFileName(null);
    }
  }

  useEffect(() => {
    if (state?.saved) formRef.current?.reset();
  }, [state]);

  const tagPreview = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <div className={styles.cardIcon}>
          <IconPlus />
        </div>
        <div className={styles.cardTitle}>New note</div>
      </div>
      <form ref={formRef} action={formAction}>
        <label className={styles.field}>
          <span className={styles.fieldLbl}>Client</span>
          <select className={styles.select} name="clientId" required defaultValue="">
            <option value="" disabled>Pick a client…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLbl}>Note</span>
          <textarea
            className={styles.textarea}
            name="body"
            required
            rows={3}
            placeholder="What happened, what they said, an idea for later…"
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLbl}>Tags (comma separated, optional)</span>
          <input
            className={styles.input}
            name="tags"
            placeholder="brand, feedback, idea"
            value={tagsRaw}
            onChange={(e) => setTagsRaw(e.target.value)}
          />
          {tagPreview.length > 0 && (
            <div className={styles.tagPreview}>
              {tagPreview.map((t) => (
                <span key={t} className={styles.tagChip} style={tintStyle(t)}>{t}</span>
              ))}
            </div>
          )}
        </label>
        <div className={styles.field}>
          <span className={styles.fieldLbl}>Image (optional)</span>
          <div
            className={`${styles.dropzone} ${dragOver ? styles.dropzoneOver : ""}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const files = e.dataTransfer.files;
              if (files.length && fileRef.current) {
                fileRef.current.files = files;
                setFileName(files[0].name);
              }
            }}
          >
            <input
              ref={fileRef}
              style={{ display: "none" }}
              type="file"
              name="image"
              accept="image/*"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            />
            {fileName ? <IconCheck /> : <IconUpload />}
            <div className={styles.dzTitle}>{fileName ?? "Drag an image here, or click to browse"}</div>
            {!fileName && <div className={styles.dzSub}>PNG or JPG</div>}
          </div>
        </div>
        {state?.error && <div className={styles.error}>{state.error}</div>}
        <button className={styles.btn} type="submit" disabled={pending}>
          <IconCheck />
          {pending ? "Saving…" : "Save note"}
        </button>
      </form>
    </div>
  );
}
