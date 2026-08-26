// The data model for the Video Studio — deliberately simple: one track,
// clips played back to back. Each clip is either an uploaded video
// (optionally trimmed to a start/end point within the source) or a still
// image held on screen for a chosen duration, with one optional text
// overlay. This is a real, working slideshow-style video editor — a
// sequence of clips + overlays + export to an actual video file — not a
// full non-linear multi-track NLE.

export interface VideoClip {
  id: string;
  kind: "video" | "image";
  src: string; // data URI — uploaded media, stored inline like design images
  name: string;
  /** Image clips: how long it's shown, in seconds. Video clips: derived from trimStart/trimEnd, kept in sync by the editor. */
  duration: number;
  /** Video clips only — the source's own duration, so trim controls have real bounds. */
  sourceDuration?: number;
  trimStart?: number;
  trimEnd?: number;
  overlayText?: string;
  overlayColor: string;
  overlayAlign: "left" | "center" | "right";
  overlayPosition: "top" | "middle" | "bottom";
}

export interface VideoDoc {
  width: number;
  height: number;
  clips: VideoClip[];
}

let seq = 0;
export function newClipId(): string {
  seq += 1;
  return `clip_${Date.now().toString(36)}_${seq}`;
}

export function blankVideoDoc(): VideoDoc {
  return { width: 1080, height: 1920, clips: [] };
}

export function normalizeVideoDoc(raw: unknown): VideoDoc | null {
  const d = raw as Record<string, unknown> | null | undefined;
  if (!d || typeof d.width !== "number" || typeof d.height !== "number" || !Array.isArray(d.clips)) return null;
  return { width: d.width, height: d.height, clips: d.clips as VideoClip[] };
}

export function totalDuration(doc: VideoDoc): number {
  return doc.clips.reduce((s, c) => s + c.duration, 0);
}
