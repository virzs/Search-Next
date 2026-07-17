import type { VersionUpdateItem } from "@/services/system";

export const formatVersionUpdateDate = (
  value?: string | null,
  locale = "zh-CN",
  includeTime = false,
) => {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(includeTime
      ? { hour: "2-digit", minute: "2-digit", hour12: false }
      : {}),
  })
    .format(date)
    .replace(/\//g, "-");
};

export const normalizeVersionUpdateContent = (
  update: VersionUpdateItem,
  whatsNewTitle: string,
) => {
  const raw = update.content?.trim() ?? "";
  if (!raw) return raw;

  let leadingTitleRemoved = false;
  return raw
    .split(/\r?\n/)
    .filter((line) => {
      const trimmed = line.trim();
      if (/^(Project|Range|Paths):\s*/i.test(trimmed)) return false;
      if (/^\[.*GitHub Release.*\]\(.*\)$/i.test(trimmed)) return false;
      if (
        !leadingTitleRemoved &&
        /^#\s+(Web|Admin|Search Next)\s*$/i.test(trimmed)
      ) {
        leadingTitleRemoved = true;
        return false;
      }
      return true;
    })
    .map((line) =>
      /^##\s+Changes\s*$/i.test(line.trim())
        ? `## ${whatsNewTitle}`
        : line,
    )
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};
