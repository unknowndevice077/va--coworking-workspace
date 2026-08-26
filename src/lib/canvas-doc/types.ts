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

/** The whole state of one design: a fixed-size canvas and a free-form list of elements. */
export interface CanvasDoc {
  width: number;
  height: number;
  background: string;
  elements: DesignElement[];
}

export interface TemplatePreset {
  id: string;
  name: string;
  category: TemplateCategory;
  keywords: string[];
  doc: CanvasDoc;
}

/** Guards against a malformed/empty `doc` (e.g. a row saved before this shape existed) crashing a render. */
export function isValidDoc(doc: unknown): doc is CanvasDoc {
  const d = doc as Partial<CanvasDoc> | null | undefined;
  return !!d && typeof d.width === "number" && typeof d.height === "number" && Array.isArray(d.elements);
}

let seq = 0;
/** Deterministic-enough id generator for elements created client-side. */
export function newElId(): string {
  seq += 1;
  return `el_${Date.now().toString(36)}_${seq}`;
}
