import type { GIconName } from "./icons";

export type TemplateCategory = "Logo" | "Social Post" | "Flyer" | "Business Card" | "Presentation";

interface BaseEl {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  zIndex: number;
}

export interface TextEl extends BaseEl {
  type: "text";
  text: string;
  fontFamily: "display" | "body";
  fontSize: number;
  fontWeight: 400 | 500 | 600 | 700;
  color: string;
  align: "left" | "center" | "right";
  lineHeight: number;
}

export interface ShapeEl extends BaseEl {
  type: "shape";
  shape: "rect" | "ellipse" | "line";
  fill: string;
  radius: number;
  opacity: number;
  stroke?: string;
  strokeWidth?: number;
}

export interface IconEl extends BaseEl {
  type: "icon";
  icon: GIconName;
  color: string;
  background?: string;
}

export interface ImageEl extends BaseEl {
  type: "image";
  src: string;
  radius: number;
}

export type DesignElement = TextEl | ShapeEl | IconEl | ImageEl;

/** Omit that distributes over a discriminated union, unlike the built-in Omit. */
export type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;

/** One page (slide) of a design — its own background and free-form elements. */
export interface CanvasPage {
  id: string;
  background: string;
  elements: DesignElement[];
}

/** The whole state of one design: a fixed canvas size shared by every page, and one or more pages — a single page for a flyer or logo, several for a deck. */
export interface CanvasDoc {
  width: number;
  height: number;
  pages: CanvasPage[];
}

export interface TemplatePreset {
  id: string;
  name: string;
  category: TemplateCategory;
  keywords: string[];
  doc: CanvasDoc;
}

/**
 * Reads back whatever is in the `doc` JSON column and returns a proper,
 * current-shape CanvasDoc — or null if it's genuinely unreadable (a row
 * saved before this shape existed, or corrupted). Also migrates the older
 * single-page shape ({ background, elements } at the top level, no
 * `pages`) into a one-page `pages` array on the fly, so nothing already
 * saved gets silently dropped when the doc shape changes.
 */
export function normalizeDoc(raw: unknown): CanvasDoc | null {
  const d = raw as Record<string, unknown> | null | undefined;
  if (!d || typeof d.width !== "number" || typeof d.height !== "number") return null;

  if (Array.isArray(d.pages)) {
    const pages = d.pages as unknown[];
    if (pages.length === 0) return null;
    const valid = pages.every(
      (p) => p && typeof (p as CanvasPage).background === "string" && Array.isArray((p as CanvasPage).elements)
    );
    if (!valid) return null;
    return { width: d.width, height: d.height, pages: pages as CanvasPage[] };
  }

  // Legacy single-page shape.
  if (typeof d.background === "string" && Array.isArray(d.elements)) {
    return {
      width: d.width,
      height: d.height,
      pages: [{ id: "page-1", background: d.background, elements: d.elements as DesignElement[] }],
    };
  }

  return null;
}

/** Boolean form of normalizeDoc, for guard-style checks. */
export function isValidDoc(doc: unknown): doc is CanvasDoc {
  return normalizeDoc(doc) !== null;
}

let seq = 0;
/** Deterministic-enough id generator for elements created client-side. */
export function newElId(): string {
  seq += 1;
  return `el_${Date.now().toString(36)}_${seq}`;
}

let pageSeq = 0;
/** Deterministic-enough id generator for pages created client-side. */
export function newPageId(): string {
  pageSeq += 1;
  return `page_${Date.now().toString(36)}_${pageSeq}`;
}
