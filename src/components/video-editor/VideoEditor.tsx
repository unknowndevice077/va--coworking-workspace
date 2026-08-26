"use client";

import { useEffect, useRef, useState, useActionState } from "react";
import Link from "next/link";
import type { VideoClip, VideoDoc } from "@/lib/video-doc/types";
import { newClipId, totalDuration } from "@/lib/video-doc/types";
import { readFileAsDataURL, getVideoDuration, drawCover, drawOverlay } from "./render";
import { updateVideoProjectAction, deleteVideoProjectAction } from "@/app/(app)/videos/actions";
import loginStyles from "@/app/login/login.module.css";
import styles from "./video-editor.module.css";

type Project = { id: string; name: string; doc: VideoDoc };

const OVERLAY_COLORS = ["#ffffff", "#131b26", "#f4c95d", "#ba904c", "#1f4b36", "#5c1f2e"];
const DEFAULT_IMAGE_DURATION = 4;
const MAX_TRIM_DEFAULT = 12;

function fmt(seconds: number) {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function newClipBase(): Pick<VideoClip, "overlayColor" | "overlayAlign" | "overlayPosition" | "overlayText"> {
  return { overlayText: "", overlayColor: "#ffffff", overlayAlign: "center", overlayPosition: "bottom" };
}

export function VideoEditor({ project }: { project: Project }) {
  const [name, setName] = useState(project.name);
  const [doc, setDoc] = useState<VideoDoc>(project.doc);
  const [selectedId, setSelectedId] = useState<string | null>(project.doc.clips[0]?.id ?? null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [busy, setBusy] = useState<string | null>(null); // "adding video" | "adding image" | null
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const imageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [saveState, saveAction, savePending] = useActionState(updateVideoProjectAction, undefined);

  const selected = doc.clips.find((c) => c.id === selectedId) ?? null;
  const playingClip = playingIndex !== null ? doc.clips[playingIndex] : null;
  const previewClip = playingClip ?? selected ?? doc.clips[0] ?? null;

  // ---------- Sequential preview playback ----------
  useEffect(() => {
    if (playingIndex === null) return;
    const clip = doc.clips[playingIndex];
    if (!clip) return; // clips shrank mid-playback — removeClip already stops playback when needed
    if (clip.kind === "image") {
      imageTimerRef.current = setTimeout(() => {
        setPlayingIndex((i) => (i !== null && i + 1 < doc.clips.length ? i + 1 : null));
      }, clip.duration * 1000);
      return () => {
        if (imageTimerRef.current) clearTimeout(imageTimerRef.current);
      };
    }
    // video clip — handled by the <video> element's own onEnded/timeupdate below
  }, [playingIndex, doc.clips]);

  function handleVideoTimeUpdate() {
    const v = previewVideoRef.current;
    const clip = playingClip;
    if (!v || !clip || clip.kind !== "video") return;
    const end = clip.trimEnd ?? clip.sourceDuration ?? v.duration;
    if (v.currentTime >= end) {
      v.pause();
      setPlayingIndex((i) => (i !== null && i + 1 < doc.clips.length ? i + 1 : null));
    }
  }

  function startPreview() {
    if (doc.clips.length === 0) return;
    const startIdx = selectedId ? doc.clips.findIndex((c) => c.id === selectedId) : 0;
    setPlayingIndex(startIdx >= 0 ? startIdx : 0);
  }
  function stopPreview() {
    setPlayingIndex(null);
    previewVideoRef.current?.pause();
  }

  // ---------- Doc mutation ----------
  function updateDoc(next: VideoDoc) {
    setDoc(next);
  }
  function updateClip(id: string, patch: Partial<VideoClip>) {
    updateDoc({ ...doc, clips: doc.clips.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  }
  function removeClip(id: string) {
    updateDoc({ ...doc, clips: doc.clips.filter((c) => c.id !== id) });
    if (selectedId === id) setSelectedId(null);
    if (playingClip?.id === id) stopPreview();
  }
  function moveClip(id: string, dir: -1 | 1) {
    const idx = doc.clips.findIndex((c) => c.id === id);
    const swapIdx = idx + dir;
    if (idx < 0 || swapIdx < 0 || swapIdx >= doc.clips.length) return;
    const clips = [...doc.clips];
    [clips[idx], clips[swapIdx]] = [clips[swapIdx], clips[idx]];
    updateDoc({ ...doc, clips });
  }

  async function handleAddVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy("Adding video…");
    try {
      const src = await readFileAsDataURL(file);
      const sourceDuration = await getVideoDuration(src);
      const trimEnd = Math.min(sourceDuration, MAX_TRIM_DEFAULT);
      const clip: VideoClip = {
        id: newClipId(),
        kind: "video",
        src,
        name: file.name,
        duration: trimEnd,
        sourceDuration,
        trimStart: 0,
        trimEnd,
        ...newClipBase(),
      };
      updateDoc({ ...doc, clips: [...doc.clips, clip] });
      setSelectedId(clip.id);
    } catch (err) {
      console.error(err);
      alert("Couldn't read that video file.");
    } finally {
      setBusy(null);
    }
  }

  async function handleAddImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy("Adding image…");
    try {
      const src = await readFileAsDataURL(file);
      const clip: VideoClip = {
        id: newClipId(),
        kind: "image",
        src,
        name: file.name,
        duration: DEFAULT_IMAGE_DURATION,
        ...newClipBase(),
      };
      updateDoc({ ...doc, clips: [...doc.clips, clip] });
      setSelectedId(clip.id);
    } finally {
      setBusy(null);
    }
  }

  // ---------- Export: draw every clip onto a canvas and record it ----------
  async function exportVideo() {
    if (doc.clips.length === 0) {
      alert("Add at least one clip first.");
      return;
    }
    if (typeof MediaRecorder === "undefined") {
      alert("This browser can't record video. Try a recent Chrome, Edge, or Firefox.");
      return;
    }
    setExporting(true);
    setExportProgress(0);
    stopPreview();
    try {
      await document.fonts.ready;
      const canvas = document.createElement("canvas");
      canvas.width = doc.width;
      canvas.height = doc.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      const stream = (canvas as HTMLCanvasElement & { captureStream: (fps?: number) => MediaStream }).captureStream(30);
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 6_000_000 });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      const stopped = new Promise<void>((resolve) => {
        recorder.onstop = () => resolve();
      });
      recorder.start(250);

      const total = totalDuration(doc);
      let elapsed = 0;

      for (const clip of doc.clips) {
        if (clip.kind === "image") {
          await renderImageClip(ctx, clip, canvas.width, canvas.height);
        } else {
          await renderVideoClip(ctx, clip, canvas.width, canvas.height, (t) => {
            setExportProgress(Math.min(99, Math.round(((elapsed + t) / total) * 100)));
          });
        }
        elapsed += clip.duration;
        setExportProgress(Math.min(99, Math.round((elapsed / total) * 100)));
      }

      recorder.stop();
      await stopped;
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${(name || "video").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.webm`;
      link.click();
      URL.revokeObjectURL(url);
      setExportProgress(100);
    } catch (err) {
      console.error(err);
      alert("Export failed — try a shorter video, or fewer/smaller clips.");
    } finally {
      setExporting(false);
    }
  }

  async function renderImageClip(ctx: CanvasRenderingContext2D, clip: VideoClip, w: number, h: number) {
    const img = await loadImage(clip.src);
    ctx.clearRect(0, 0, w, h);
    drawCover(ctx, img, img.naturalWidth, img.naturalHeight, w, h);
    drawOverlay(ctx, clip, w, h);
    await sleep(clip.duration * 1000);
  }

  function renderVideoClip(ctx: CanvasRenderingContext2D, clip: VideoClip, w: number, h: number, onProgress: (t: number) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      const v = document.createElement("video");
      v.src = clip.src;
      v.muted = true;
      v.playsInline = true;
      const start = clip.trimStart ?? 0;
      const end = clip.trimEnd ?? clip.sourceDuration ?? start + clip.duration;
      let raf = 0;
      let done = false;

      const finish = () => {
        if (done) return;
        done = true;
        cancelAnimationFrame(raf);
        v.pause();
        resolve();
      };

      const draw = () => {
        if (done) return;
        drawCover(ctx, v, v.videoWidth, v.videoHeight, w, h);
        drawOverlay(ctx, clip, w, h);
        onProgress(v.currentTime - start);
        if (v.currentTime >= end) {
          finish();
          return;
        }
        raf = requestAnimationFrame(draw);
      };

      v.onloadedmetadata = () => {
        v.currentTime = start;
      };
      v.onseeked = () => {
        v.play().then(() => {
          raf = requestAnimationFrame(draw);
        }).catch(reject);
      };
      v.onerror = () => reject(new Error("Couldn't play a video clip"));
    });
  }

  const docJson = JSON.stringify(doc);
  const canPlay = doc.clips.length > 0;

  return (
    <div className={styles.studioShell}>
      <div className={styles.topbar}>
        <Link href="/videos" className={styles.homeBtn} aria-label="Back to Video Studio">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 10.5 12 4l9 6.5" />
            <path d="M5 9.5V20a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1V9.5" />
          </svg>
        </Link>
        <div className={styles.topbarDivider} />
        <input className={styles.nameInput} value={name} onChange={(e) => setName(e.target.value)} aria-label="Video name" />
        <span className={styles.statusText}>{doc.clips.length} clip{doc.clips.length === 1 ? "" : "s"} · {fmt(totalDuration(doc))}</span>
        <div className={styles.topbarSpacer} />
        <button type="button" className={styles.topbarGhostBtn} disabled={exporting || !canPlay} onClick={exportVideo}>
          {exporting ? `Exporting… ${exportProgress}%` : "Export video"}
        </button>
        <form action={saveAction}>
          <input type="hidden" name="id" value={project.id} />
          <input type="hidden" name="name" value={name} />
          <input type="hidden" name="doc" value={docJson} />
          <button className={styles.topbarSaveBtn} type="submit" disabled={savePending}>
            {savePending ? "Saving…" : saveState?.saved ? "Saved ✓" : "Save"}
          </button>
        </form>
      </div>
      {saveState?.error && <div className={`${loginStyles.error} ${styles.saveError}`}>{saveState.error}</div>}

      <div className={styles.workspace}>
        <div className={styles.rail}>
          <button type="button" className={styles.railBtn} onClick={() => videoInputRef.current?.click()} disabled={busy !== null}>
            <span className={styles.railIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                <rect x="2.5" y="5.5" width="14" height="13" rx="2" />
                <path d="m16.5 10 5-3v10l-5-3Z" />
              </svg>
            </span>
            Add Video
          </button>
          <button type="button" className={styles.railBtn} onClick={() => imageInputRef.current?.click()} disabled={busy !== null}>
            <span className={styles.railIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="m7 15 3.5-4.5L13 14l2-2.5L20 15" />
              </svg>
            </span>
            Add Image
          </button>
          <input ref={videoInputRef} type="file" accept="video/*" hidden onChange={handleAddVideo} />
          <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={handleAddImage} />
          {busy && <div className={styles.busyNote}>{busy}</div>}
        </div>

        <div className={styles.previewArea}>
          <div className={styles.previewBox} style={{ aspectRatio: `${doc.width} / ${doc.height}` }}>
            {previewClip ? (
              <>
                {previewClip.kind === "video" ? (
                  <video
                    key={previewClip.id}
                    ref={previewVideoRef}
                    src={previewClip.src}
                    muted
                    playsInline
                    autoPlay={playingClip !== null}
                    onLoadedMetadata={(e) => {
                      e.currentTarget.currentTime = previewClip.trimStart ?? 0;
                    }}
                    onTimeUpdate={playingClip ? handleVideoTimeUpdate : undefined}
                    className={styles.previewMedia}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={previewClip.id} src={previewClip.src} alt="" className={styles.previewMedia} />
                )}
                {previewClip.overlayText && (
                  <div
                    className={styles.previewOverlay}
                    style={{
                      justifyContent: previewClip.overlayPosition === "top" ? "flex-start" : previewClip.overlayPosition === "middle" ? "center" : "flex-end",
                      textAlign: previewClip.overlayAlign,
                      alignItems: previewClip.overlayAlign === "left" ? "flex-start" : previewClip.overlayAlign === "right" ? "flex-end" : "center",
                    }}
                  >
                    <span style={{ color: previewClip.overlayColor }}>{previewClip.overlayText}</span>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.previewEmpty}>Add a video or image clip to get started</div>
            )}
          </div>
          <div className={styles.transportRow}>
            {playingIndex === null ? (
              <button type="button" className={styles.transportBtn} onClick={startPreview} disabled={!canPlay}>▶ Play</button>
            ) : (
              <button type="button" className={styles.transportBtn} onClick={stopPreview}>⏸ Stop</button>
            )}
          </div>
        </div>

        <div className={styles.rightPanel}>
          {!selected ? (
            <div className={styles.hint}>Select a clip below to edit its text overlay{selected === null && doc.clips.length ? "" : ""}, or add one from the left.</div>
          ) : (
            <div>
              <div className={styles.panelHeader}>
                <span className={styles.panelHeaderLabel}>{selected.kind === "video" ? "Video clip" : "Image clip"}</span>
                <button type="button" className={styles.iconBtn} onClick={() => removeClip(selected.id)} aria-label="Delete clip" style={{ color: "var(--bad)" }}>
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" />
                  </svg>
                </button>
              </div>

              {selected.kind === "image" && (
                <div className={styles.propGroup}>
                  <div className={styles.propLabel}>Duration (seconds)</div>
                  <input
                    type="number"
                    className={styles.numInput}
                    min={1}
                    max={30}
                    value={selected.duration}
                    onChange={(e) => updateClip(selected.id, { duration: Math.max(1, Number(e.target.value) || 1) })}
                  />
                </div>
              )}

              {selected.kind === "video" && (
                <>
                  <div className={styles.propGroup}>
                    <div className={styles.propLabel}>Trim start ({fmt(selected.trimStart ?? 0)})</div>
                    <input
                      type="range"
                      className={styles.rangeInput}
                      min={0}
                      max={Math.max(0, (selected.sourceDuration ?? 0) - 0.5)}
                      step={0.1}
                      value={selected.trimStart ?? 0}
                      onChange={(e) => {
                        const trimStart = Math.min(Number(e.target.value), (selected.trimEnd ?? 0) - 0.5);
                        updateClip(selected.id, { trimStart, duration: (selected.trimEnd ?? 0) - trimStart });
                      }}
                    />
                  </div>
                  <div className={styles.propGroup}>
                    <div className={styles.propLabel}>Trim end ({fmt(selected.trimEnd ?? selected.sourceDuration ?? 0)})</div>
                    <input
                      type="range"
                      className={styles.rangeInput}
                      min={Math.min((selected.trimStart ?? 0) + 0.5, selected.sourceDuration ?? 0)}
                      max={selected.sourceDuration ?? 0}
                      step={0.1}
                      value={selected.trimEnd ?? selected.sourceDuration ?? 0}
                      onChange={(e) => {
                        const trimEnd = Math.max(Number(e.target.value), (selected.trimStart ?? 0) + 0.5);
                        updateClip(selected.id, { trimEnd, duration: trimEnd - (selected.trimStart ?? 0) });
                      }}
                    />
                  </div>
                </>
              )}

              <div className={styles.propGroup}>
                <div className={styles.propLabel}>Text overlay</div>
                <textarea
                  className={styles.textArea}
                  rows={2}
                  value={selected.overlayText ?? ""}
                  onChange={(e) => updateClip(selected.id, { overlayText: e.target.value })}
                  placeholder="Optional caption over this clip"
                />
              </div>

              {selected.overlayText && (
                <>
                  <div className={styles.propGroup}>
                    <div className={styles.propLabel}>Text color</div>
                    <div className={styles.swatchRow}>
                      {OVERLAY_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          aria-label={`Text color ${c}`}
                          className={`${styles.swatch} ${selected.overlayColor === c ? styles.swatchOn : ""}`}
                          style={{ background: c, border: c === "#ffffff" ? "1px solid var(--border)" : undefined }}
                          onClick={() => updateClip(selected.id, { overlayColor: c })}
                        />
                      ))}
                      <label className={styles.customSwatch} style={{ background: selected.overlayColor }}>
                        <input type="color" value={selected.overlayColor} onChange={(e) => updateClip(selected.id, { overlayColor: e.target.value })} />
                      </label>
                    </div>
                  </div>
                  <div className={styles.propGroup}>
                    <div className={styles.propLabel}>Align</div>
                    <div className={styles.segRow}>
                      {(["left", "center", "right"] as const).map((a) => (
                        <button
                          key={a}
                          type="button"
                          className={`${styles.segBtn} ${selected.overlayAlign === a ? styles.segOn : ""}`}
                          onClick={() => updateClip(selected.id, { overlayAlign: a })}
                        >
                          {a[0].toUpperCase() + a.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.propGroup}>
                    <div className={styles.propLabel}>Position</div>
                    <div className={styles.segRow}>
                      {(["top", "middle", "bottom"] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          className={`${styles.segBtn} ${selected.overlayPosition === p ? styles.segOn : ""}`}
                          onClick={() => updateClip(selected.id, { overlayPosition: p })}
                        >
                          {p[0].toUpperCase() + p.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <form action={deleteVideoProjectAction} className={styles.discardForm}>
            <input type="hidden" name="id" value={project.id} />
            <button
              type="submit"
              className={styles.linkBtn}
              onClick={(e) => {
                if (!confirm("Delete this video project? This can't be undone.")) e.preventDefault();
              }}
            >
              Delete this video
            </button>
          </form>
        </div>
      </div>

      <div className={styles.clipStrip}>
        <div className={styles.clipStripScroll}>
          {doc.clips.map((clip, i) => (
            <div key={clip.id} className={`${styles.clipThumbWrap} ${clip.id === selectedId ? styles.clipThumbOn : ""}`}>
              <button type="button" className={styles.clipThumbBtn} onClick={() => setSelectedId(clip.id)}>
                {clip.kind === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={clip.src} alt="" className={styles.clipThumbImg} />
                ) : (
                  <div className={styles.clipThumbVideo}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2.5" y="5.5" width="14" height="13" rx="2" />
                      <path d="m16.5 10 5-3v10l-5-3Z" />
                    </svg>
                  </div>
                )}
                <span className={styles.clipDuration}>{fmt(clip.duration)}</span>
              </button>
              <div className={styles.clipThumbActions}>
                <button type="button" className={styles.pageMiniBtn} onClick={() => moveClip(clip.id, -1)} disabled={i === 0} aria-label="Move earlier">‹</button>
                <button type="button" className={styles.pageMiniBtn} onClick={() => moveClip(clip.id, 1)} disabled={i === doc.clips.length - 1} aria-label="Move later">›</button>
              </div>
            </div>
          ))}
          <button type="button" className={styles.addClipBtn} onClick={() => videoInputRef.current?.click()} aria-label="Add clip">+</button>
        </div>
      </div>
    </div>
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Couldn't load image"));
    img.src = src;
  });
}
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
