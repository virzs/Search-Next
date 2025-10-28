export type GradientOptions = {
  stops?: number;
  saturationRange?: [number, number];
  lightnessRange?: [number, number];
  angleGranularity?: number;
  hueShiftRange?: [number, number];
  stripPlusTag?: boolean;
};

export type GradientResult = {
  angle: number;
  colors: string[];
  css: string;
};

function normalizeEmail(email: string, stripPlusTag = true) {
  let e = (email || "unknown").trim().toLowerCase();
  if (stripPlusTag) {
    const at = e.indexOf("@");
    if (at > 0) {
      const local = e.slice(0, at);
      const plus = local.indexOf("+");
      if (plus >= 0) e = local.slice(0, plus) + e.slice(at);
    }
  }
  return e;
}

function fnv1a32(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash >>> 0) * 0x01000193;
    hash >>>= 0;
  }
  return hash >>> 0;
}

function makeLCG(seed: number) {
  let s = seed >>> 0;
  return function rand() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function hsl(h: number, s: number, l: number) {
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

export function emailToGradient(email: string, opts: GradientOptions = {}): GradientResult {
  const {
    stops = 3,
    saturationRange = [55, 70],
    lightnessRange = [45, 60],
    angleGranularity = 15,
    hueShiftRange = [30, 90],
    stripPlusTag = true,
  } = opts;

  const normalized = normalizeEmail(email, stripPlusTag);
  const seed = fnv1a32(normalized);
  const rand = makeLCG(seed);

  const rawAngle = Math.floor(rand() * 360);
  const angle =
    angleGranularity > 0
      ? Math.round(rawAngle / angleGranularity) * angleGranularity
      : rawAngle;

  const baseHue = rand() * 360;
  const sat = saturationRange[0] + rand() * (saturationRange[1] - saturationRange[0]);
  const light = lightnessRange[0] + rand() * (lightnessRange[1] - lightnessRange[0]);

  const colors: string[] = [];
  colors.push(hsl(baseHue, sat, light));

  for (let i = 1; i < stops; i++) {
    const shift = hueShiftRange[0] + rand() * (hueShiftRange[1] - hueShiftRange[0]);
    const dir = rand() < 0.5 ? -1 : 1;
    const hue = (baseHue + dir * shift + 360) % 360;
    const satDelta = (rand() - 0.5) * 10;
    const lightDelta = (rand() - 0.5) * 12;
    const s2 = clamp(sat + satDelta, saturationRange[0], saturationRange[1]);
    const l2 = clamp(light + lightDelta, lightnessRange[0], lightnessRange[1]);
    colors.push(hsl(hue, s2, l2));
  }

  const offsets = colors.map((_, i) => Math.round((i / (colors.length - 1)) * 100));
  const css = `linear-gradient(${angle}deg, ${colors
    .map((c, i) => `${c} ${offsets[i]}%`)
    .join(", ")})`;

  return { angle, colors, css };
}

export function gradientToSvgDataUri(result: GradientResult, width = 1200, height = 630): string {
  const { angle, colors } = result;
  const offsets = colors.map((_, i) => Math.round((i / (colors.length - 1)) * 100));
  const stops = colors.map((c, i) => `<stop offset="${offsets[i]}%" stop-color="${c}" />`).join("");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
    `<defs>` +
    `<linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform="rotate(${angle})">` +
    stops +
    `</linearGradient>` +
    `</defs>` +
    `<rect width="100%" height="100%" fill="url(#g)" />` +
    `</svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

export function gradientToPngDataUri(result: GradientResult, width = 1200, height = 630): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const angleRad = (result.angle * Math.PI) / 180;
  const cx = width / 2;
  const cy = height / 2;
  const halfDiag = Math.sqrt(width * width + height * height) / 2;
  const x1 = cx - Math.cos(angleRad) * halfDiag;
  const y1 = cy - Math.sin(angleRad) * halfDiag;
  const x2 = cx + Math.cos(angleRad) * halfDiag;
  const y2 = cy + Math.sin(angleRad) * halfDiag;
  const grad = ctx.createLinearGradient(x1, y1, x2, y2);
  const offsets = result.colors.map((_, i) => i / (result.colors.length - 1));
  result.colors.forEach((c, i) => grad.addColorStop(offsets[i], c));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
  return canvas.toDataURL("image/png");
}