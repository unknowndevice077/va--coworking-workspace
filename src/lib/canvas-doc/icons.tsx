// A small, reusable set of 24x24 stroke-icon paths for chips, marks, and
// footers across the graphic templates. Deliberately generic (not tied to
// any one template's story) so any template can pick whichever reads best.
export const gIcons = {
  pin: "M12 21s-7-6.2-7-11.5A7 7 0 0 1 12 2a7 7 0 0 1 7 7.5C19 14.8 12 21 12 21Z M12 12.3a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6Z",
  shield: "M12 3l7 4v6c0 4-3 7-7 8-4-1-7-4-7-8V7Z",
  drop: "M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z",
  check: "M5 12.5 10 17l9-10",
  bolt: "M13 2 4 14h7l-1 8 9-12h-7Z",
  star: "M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6Z",
  calendar: "M3 5h18v16H3Z M3 10h18 M8 3v4 M16 3v4",
  phone: "M5 4h3l2 5-2 1.5c1 2.5 3 4.5 5.5 5.5L15 14l5 2v3c0 1-1 2-2 2C10 21 3 14 3 6c0-1 1-2 2-2Z",
  mail: "M4 6h16v12H4Z M4 6l8 7 8-7",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M3 12h18 M12 3a14 14 0 0 1 0 18 M12 3a14 14 0 0 0 0 18",
  leaf: "M6 20c8 0 12-6 12-14-8 0-12 6-12 14Z M6 20c2-4 5-7 9-9",
  sparkle: "M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8Z",
  arrowRight: "m11 4 7 7-7 7M4 11h13",
  clock: "M12 7v5l3 2 M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z",
  briefcase: "M4 8h16v11H4Z M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  home: "M3 10.5 12 4l9 6.5 M5 9.5V20a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1V9.5",
  users: "M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6 M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M15.5 14.2c2.6.4 4.5 2.6 4.5 5.3 M17 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  bed: "M3 18v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4 M3 18v2M21 18v2 M5 12V7a2 2 0 0 1 2-2h3v5",
  bath: "M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z M7 12V6a2 2 0 0 1 3-1.9 M4 19v2 M20 19v2",
  sqft: "M3 9h18v6H3Z M7 9v3M11 9v3M15 9v3",
  lot: "M4 4h16v16H4Z",
  trendUp: "M12 19V5M5 12l7-7 7 7",
  trendDown: "M12 5v14M19 12l-7 7-7-7",
  xmark: "M18 6 6 18M6 6l12 12",
  camera: "M4 8h3l2-2h6l2 2h3v11H4V8Z M8.5 14a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0",
} as const;

export type GIconName = keyof typeof gIcons;

export function GIcon({
  name,
  size = 20,
  stroke = "currentColor",
  strokeWidth = 1.8,
  filled = false,
}: {
  name: GIconName;
  size?: number;
  stroke?: string;
  strokeWidth?: number;
  /** Solid-fill the icon in its own stroke color — for things like a star rating, not just outlines. */
  filled?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={filled ? stroke : "none"}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={gIcons[name]} />
    </svg>
  );
}
