type LogoProps = { size?: number; className?: string };

/**
 * VA Hub's mark: the same three strokes read as both initials — the
 * converging diagonals are a "V", and the crossbar turns the identical
 * silhouette into an "A". A fixed navy badge, so it looks the same in the
 * sidebar and the login card, in light or dark mode.
 */
export function Logo({ size = 27, className }: LogoProps) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.185),
        background: "oklch(0.22 0.025 255)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 48 48" fill="none">
        <path
          d="M8 8 L24 40 L40 8"
          stroke="oklch(0.4 0.075 255)"
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="17"
          y1="26"
          x2="31"
          y2="26"
          stroke="oklch(0.68 0.1 78)"
          strokeWidth={4}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
