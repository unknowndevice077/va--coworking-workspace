import type { VideoClip } from "@/lib/video-doc/types";

/** Reads a File as a data: URL — same storage approach as design images. */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Loads a video just far enough to read its natural duration. */
export function getVideoDuration(src: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.src = src;
    v.onloadedmetadata = () => resolve(Number.isFinite(v.duration) ? v.duration : 0);
    v.onerror = () => reject(new Error("Couldn't read video metadata"));
  });
}

/** Draws a video/image frame onto the canvas, scaled to cover it (crop, not letterbox) — same idea as CSS object-fit: cover. */
export function drawCover(ctx: CanvasRenderingContext2D, media: CanvasImageSource, mediaW: number, mediaH: number, canvasW: number, canvasH: number) {
  if (!mediaW || !mediaH) return;
  const scale = Math.max(canvasW / mediaW, canvasH / mediaH);
  const w = mediaW * scale;
  const h = mediaH * scale;
  const dx = (canvasW - w) / 2;
  const dy = (canvasH - h) / 2;
  ctx.drawImage(media, dx, dy, w, h);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Draws a clip's text overlay, word-wrapped, positioned top/middle/bottom and left/center/right. */
export function drawOverlay(ctx: CanvasRenderingContext2D, clip: VideoClip, canvasW: number, canvasH: number) {
  if (!clip.overlayText?.trim()) return;
  const fontSize = Math.round(canvasW * 0.058);
  const lineHeight = fontSize * 1.25;
  const padding = Math.round(canvasW * 0.06);
  const maxWidth = canvasW - padding * 2;

  ctx.font = `700 ${fontSize}px 'Space Grotesk', system-ui, sans-serif`;
  ctx.textAlign = clip.overlayAlign;
  ctx.textBaseline = "alphabetic";
  const lines = wrapText(ctx, clip.overlayText, maxWidth);
  const blockHeight = lines.length * lineHeight;

  let startY: number;
  if (clip.overlayPosition === "top") startY = padding + fontSize;
  else if (clip.overlayPosition === "middle") startY = canvasH / 2 - blockHeight / 2 + fontSize;
  else startY = canvasH - padding - blockHeight + fontSize;

  const x = clip.overlayAlign === "left" ? padding : clip.overlayAlign === "right" ? canvasW - padding : canvasW / 2;

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = fontSize * 0.25;
  ctx.fillStyle = clip.overlayColor;
  lines.forEach((line, i) => {
    ctx.fillText(line, x, startY + i * lineHeight);
  });
  ctx.restore();
}
