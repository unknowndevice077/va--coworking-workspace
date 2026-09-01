// A small deterministic color palette used to color-code clients and tags
// throughout the app (Notes, and anywhere else a list of client-owned items
// benefits from being scannable by color). Same key always maps to the same
// tint, so a client's color stays stable across pages/sessions.
const TINTS = ["blue", "teal", "plum", "gold", "coral"] as const;

export type Tint = (typeof TINTS)[number];

export function tintFor(key: string): Tint {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return TINTS[hash % TINTS.length];
}

export function tintStyle(key: string): { background: string; color: string } {
  const t = tintFor(key);
  return { background: `var(--tint-${t}-bg)`, color: `var(--tint-${t}-fg)` };
}

export function tintDotStyle(key: string): { background: string } {
  const t = tintFor(key);
  return { background: `var(--tint-${t}-fg)` };
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
