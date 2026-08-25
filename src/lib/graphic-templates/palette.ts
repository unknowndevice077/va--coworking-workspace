// Every graphic template is recolored from a single hue (0-360) so the same
// swatch picker used across the studio works uniformly for every template,
// no matter how different their layouts are. Roles mirror what a real brand
// palette needs: a deep ink for bars/text, a mid tone for accents/icons, and
// two light tints for card backgrounds.
export interface Palette {
  deep: string;
  mid: string;
  tint: string;
  tint2: string;
  ink: string;
  hue: number;
}

// Colors are resolved to plain hex (not CSS oklch()) on purpose: html2canvas
// — used for the "Download PNG" export — ships its own CSS color parser
// that doesn't understand oklch()/lab(), and silently fails the whole
// capture if any element resolves to one. Converting once here means every
// template can just use these strings without worrying about that.
function oklchToHex(l: number, c: number, hDeg: number): string {
  const hRad = (hDeg * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const l3 = l_ ** 3;
  const m3 = m_ ** 3;
  const s3 = s_ ** 3;

  const r = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const bch = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  const gamma = (x: number) => {
    const v = Math.min(1, Math.max(0, x));
    return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
  };

  const toHex = (x: number) =>
    Math.round(gamma(x) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(bch)}`;
}

export function paletteFromHue(hue: number): Palette {
  return {
    deep: oklchToHex(0.32, 0.085, hue),
    mid: oklchToHex(0.52, 0.11, hue),
    tint: oklchToHex(0.955, 0.018, hue),
    tint2: oklchToHex(0.91, 0.032, hue),
    ink: oklchToHex(0.46, 0.03, hue),
    hue,
  };
}
