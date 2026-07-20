import type { AppColorScheme } from "./config";

export const DEFAULT_THEME_COLOR = "rgb(250, 84, 28)";

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

const clampChannel = (value: number) =>
  Math.max(0, Math.min(255, Math.round(value)));

const parseRgb = (value?: string | null): RgbColor | null => {
  const match = String(value ?? "")
    .trim()
    .match(
      /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i,
    );
  if (!match) return null;
  const [r, g, b] = match.slice(1).map(Number);
  if ([r, g, b].some((channel) => channel < 0 || channel > 255)) {
    return null;
  }
  return { r, g, b };
};

const formatRgb = ({ r, g, b }: RgbColor) =>
  `rgb(${clampChannel(r)}, ${clampChannel(g)}, ${clampChannel(b)})`;

const mix = (source: RgbColor, target: RgbColor, amount: number): RgbColor => ({
  r: source.r + (target.r - source.r) * amount,
  g: source.g + (target.g - source.g) * amount,
  b: source.b + (target.b - source.b) * amount,
});

const toLinear = (channel: number) => {
  const value = channel / 255;
  return value <= 0.04045
    ? value / 12.92
    : Math.pow((value + 0.055) / 1.055, 2.4);
};

const luminance = (color: RgbColor) =>
  0.2126 * toLinear(color.r) +
  0.7152 * toLinear(color.g) +
  0.0722 * toLinear(color.b);

const contrast = (left: RgbColor, right: RgbColor) => {
  const lighter = Math.max(luminance(left), luminance(right));
  const darker = Math.min(luminance(left), luminance(right));
  return (lighter + 0.05) / (darker + 0.05);
};

const white = { r: 255, g: 255, b: 255 };
const black = { r: 0, g: 0, b: 0 };

const createReadableTextColor = (
  color: RgbColor,
  colorScheme: AppColorScheme,
) => {
  const surface = colorScheme === "dark" ? { r: 36, g: 36, b: 38 } : white;
  const target = colorScheme === "dark" ? white : black;
  let candidate = color;

  for (let step = 0; step <= 12 && contrast(candidate, surface) < 4.5; step++) {
    candidate = mix(candidate, target, 0.12);
  }
  return candidate;
};

export const normalizeThemeColor = (value?: string | null) =>
  formatRgb(parseRgb(value) ?? (parseRgb(DEFAULT_THEME_COLOR) as RgbColor));

export const createAccentPalette = (
  value: string | null | undefined,
  colorScheme: AppColorScheme,
) => {
  const color = parseRgb(normalizeThemeColor(value)) as RgbColor;
  const onAccent =
    contrast(color, black) >= contrast(color, white) ? black : white;

  return {
    primary: formatRgb(color),
    hover: formatRgb(mix(color, white, 0.12)),
    active: formatRgb(mix(color, black, 0.12)),
    text: formatRgb(createReadableTextColor(color, colorScheme)),
    onAccent: formatRgb(onAccent),
    alpha: (opacity: number) =>
      `rgba(${clampChannel(color.r)}, ${clampChannel(color.g)}, ${clampChannel(
        color.b,
      )}, ${opacity})`,
  };
};

export const installAccentThemeCssVariables = (
  value: string | null | undefined,
  colorScheme: AppColorScheme,
  root: HTMLElement = document.documentElement,
) => {
  const palette = createAccentPalette(value, colorScheme);
  root.style.setProperty("--sn-accent", palette.primary);
  root.style.setProperty("--sn-accent-hover", palette.hover);
  root.style.setProperty("--sn-accent-active", palette.active);
  root.style.setProperty("--sn-accent-text", palette.text);
  root.style.setProperty("--sn-on-accent", palette.onAccent);
  root.style.setProperty("--sn-accent-soft", palette.alpha(0.1));
};
