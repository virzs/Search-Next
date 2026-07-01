export type UnifiedSearchShortcutModifier =
  | "mod"
  | "ctrl"
  | "meta"
  | "alt"
  | "shift";

export interface UnifiedSearchShortcut {
  key: string;
  modifiers: UnifiedSearchShortcutModifier[];
}

export const defaultUnifiedSearchShortcut: UnifiedSearchShortcut = {
  key: "k",
  modifiers: ["mod"],
};

const modifierOrder: UnifiedSearchShortcutModifier[] = [
  "mod",
  "ctrl",
  "alt",
  "shift",
  "meta",
];

const modifierKeys = new Set([
  "Alt",
  "AltGraph",
  "Control",
  "Meta",
  "OS",
  "Shift",
]);

export const isMacPlatform = () => {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad/i.test(
    `${navigator.platform ?? ""} ${navigator.userAgent ?? ""}`,
  );
};

export const getSystemShortcutModifierName = () =>
  isMacPlatform() ? "Command" : "Ctrl";

const normalizeKey = (key: unknown) => {
  const value = String(key ?? "").trim();
  if (!value || modifierKeys.has(value)) return "";
  if (value.length === 1) return value.toLowerCase();
  return value.toLowerCase().replace(/\s+/g, "");
};

export const normalizeUnifiedSearchShortcut = (
  shortcut: Partial<UnifiedSearchShortcut> | undefined,
): UnifiedSearchShortcut => {
  const key = normalizeKey(shortcut?.key) || defaultUnifiedSearchShortcut.key;
  const modifiers = Array.from(
    new Set(
      (shortcut?.modifiers ?? defaultUnifiedSearchShortcut.modifiers).filter(
        (modifier): modifier is UnifiedSearchShortcutModifier =>
          modifierOrder.includes(modifier as UnifiedSearchShortcutModifier),
      ),
    ),
  ).sort((a, b) => modifierOrder.indexOf(a) - modifierOrder.indexOf(b));

  return {
    key,
    modifiers: modifiers.length
      ? modifiers
      : defaultUnifiedSearchShortcut.modifiers,
  };
};

const getExpectedModifierState = (shortcut: UnifiedSearchShortcut) => {
  const isMac = isMacPlatform();
  const modifiers = new Set(shortcut.modifiers);
  return {
    metaKey: modifiers.has("meta") || (modifiers.has("mod") && isMac),
    ctrlKey: modifiers.has("ctrl") || (modifiers.has("mod") && !isMac),
    altKey: modifiers.has("alt"),
    shiftKey: modifiers.has("shift"),
  };
};

export const matchesUnifiedSearchShortcut = (
  event: KeyboardEvent,
  shortcut: Partial<UnifiedSearchShortcut> | undefined,
) => {
  const normalizedShortcut = normalizeUnifiedSearchShortcut(shortcut);
  const expected = getExpectedModifierState(normalizedShortcut);
  return (
    normalizeKey(event.key) === normalizedShortcut.key &&
    event.metaKey === expected.metaKey &&
    event.ctrlKey === expected.ctrlKey &&
    event.altKey === expected.altKey &&
    event.shiftKey === expected.shiftKey
  );
};

export const isShortcutModifierOnlyKey = (event: KeyboardEvent) =>
  modifierKeys.has(event.key);

export const hasRequiredShortcutModifier = (event: KeyboardEvent) =>
  event.metaKey || event.ctrlKey || event.altKey;

export const createUnifiedSearchShortcutFromEvent = (
  event: KeyboardEvent,
): UnifiedSearchShortcut | null => {
  const key = normalizeKey(event.key);
  if (!key || !hasRequiredShortcutModifier(event)) return null;

  const isMac = isMacPlatform();
  const modifiers: UnifiedSearchShortcutModifier[] = [];
  if ((isMac && event.metaKey && !event.ctrlKey) || (!isMac && event.ctrlKey)) {
    modifiers.push("mod");
  } else {
    if (event.ctrlKey) modifiers.push("ctrl");
    if (event.metaKey) modifiers.push("meta");
  }
  if (event.altKey) modifiers.push("alt");
  if (event.shiftKey) modifiers.push("shift");

  return normalizeUnifiedSearchShortcut({ key, modifiers });
};

const modifierLabelMap = {
  mod: () => (isMacPlatform() ? "⌘" : "Ctrl"),
  ctrl: () => (isMacPlatform() ? "⌃" : "Ctrl"),
  meta: () => (isMacPlatform() ? "⌘" : "Win"),
  alt: () => (isMacPlatform() ? "⌥" : "Alt"),
  shift: () => (isMacPlatform() ? "⇧" : "Shift"),
} satisfies Record<UnifiedSearchShortcutModifier, () => string>;

const keyLabelMap: Record<string, string> = {
  " ": "Space",
  arrowdown: "↓",
  arrowleft: "←",
  arrowright: "→",
  arrowup: "↑",
  backspace: "⌫",
  delete: "Del",
  enter: "Enter",
  escape: "Esc",
  tab: "Tab",
};

export const getUnifiedSearchShortcutParts = (
  shortcut: Partial<UnifiedSearchShortcut> | undefined,
) => {
  const normalizedShortcut = normalizeUnifiedSearchShortcut(shortcut);
  return [
    ...normalizedShortcut.modifiers.map((modifier) =>
      modifierLabelMap[modifier](),
    ),
    keyLabelMap[normalizedShortcut.key] ??
      normalizedShortcut.key.toUpperCase(),
  ];
};

export const formatUnifiedSearchShortcut = (
  shortcut: Partial<UnifiedSearchShortcut> | undefined,
) => getUnifiedSearchShortcutParts(shortcut).join(" ");
