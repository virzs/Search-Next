export const isSafeGradientCss = (value: string) => {
  const css = String(value || "").trim();
  if (
    !css ||
    !/^(?:repeating-)?(?:linear|radial|conic)-gradient\(/i.test(css) ||
    /[;{}\\]/.test(css) ||
    /\/\*|\*\//.test(css) ||
    /(?:url\s*\(|@import|expression\s*\(|javascript\s*:|data\s*:|var\s*\()/i.test(
      css,
    )
  ) {
    return false;
  }
  if (typeof CSS !== "undefined" && !CSS.supports("background", css)) {
    return false;
  }
  let depth = 0;
  for (const char of css) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (depth < 0) return false;
  }
  return depth === 0;
};

export type ParsedGradientLayer = {
  type: string;
  orientation?: string;
  stops: string[];
  value: string;
};

const splitTopLevel = (value: string) => {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (char === "," && depth === 0) {
      parts.push(value.slice(start, index).trim());
      start = index + 1;
    }
  }
  parts.push(value.slice(start).trim());
  return parts.filter(Boolean);
};

export const splitGradientLayers = (value: string) => splitTopLevel(value);

const hasOrientation = (type: string, value: string) => {
  const first = value.trim().toLowerCase();
  if (type.includes("linear")) {
    return (
      first.startsWith("to ") ||
      /^-?(?:\d+\.?\d*|\.\d+)(?:deg|grad|rad|turn)\b/.test(first)
    );
  }
  if (type.includes("radial")) {
    return (
      /\bat\b/.test(first) ||
      /^(?:circle|ellipse|closest-side|closest-corner|farthest-side|farthest-corner|contain|cover)\b/.test(
        first,
      ) ||
      /^-?(?:\d+\.?\d*|\.\d+)(?:%|px|em|rem)\s+-?(?:\d+\.?\d*|\.\d+)(?:%|px|em|rem)/.test(
        first,
      )
    );
  }
  if (type.includes("conic")) {
    return /^(?:from|at)\b/.test(first);
  }
  return false;
};

export const parseGradientLayer = (
  value: string,
): ParsedGradientLayer | null => {
  const normalized = value.trim();
  const match = normalized.match(
    /^((?:repeating-)?(?:linear|radial|conic)-gradient)\((.*)\)$/is,
  );
  if (!match) return null;
  const [, type, content] = match;
  const parts = splitTopLevel(content);
  if (parts.length < 2) return null;
  const orientation = hasOrientation(type, parts[0]) ? parts[0] : undefined;
  const stops = orientation ? parts.slice(1) : parts;
  if (stops.length < 2) return null;
  return { type: type.toLowerCase(), orientation, stops, value: normalized };
};

export const toPickerGradient = (layer: ParsedGradientLayer) => {
  if (layer.type === "linear-gradient") {
    return `linear-gradient(${layer.orientation || "90deg"}, ${layer.stops.join(", ")})`;
  }
  if (layer.type === "radial-gradient") {
    return `radial-gradient(circle, ${layer.stops.join(", ")})`;
  }
  return null;
};

export const mergePickerGradient = (
  original: ParsedGradientLayer,
  pickerValue: string,
) => {
  const next = parseGradientLayer(pickerValue);
  if (!next || !toPickerGradient(next)) return original.value;
  const sameRadialType =
    original.type === "radial-gradient" && next.type === "radial-gradient";
  const orientation = sameRadialType
    ? original.orientation || "circle"
    : next.orientation ||
      (next.type === "radial-gradient" ? "circle" : "90deg");
  return `${next.type}(${orientation}, ${next.stops.join(", ")})`;
};
