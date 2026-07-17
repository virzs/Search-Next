import { VERSION_UPDATE_READ_IDS_STORAGE_KEY } from "./storage";

export const VERSION_UPDATE_READ_IDS_CHANGED_EVENT =
  "search-next:version-update-read-ids-changed";

const readIds = (key: string) => {
  const raw = localStorage.getItem(key);
  if (!raw) return [] as string[];
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
};

export const getVersionUpdateReadIds = () =>
  readIds(VERSION_UPDATE_READ_IDS_STORAGE_KEY);

export const setVersionUpdateReadIds = (ids: string[]) => {
  localStorage.setItem(
    VERSION_UPDATE_READ_IDS_STORAGE_KEY,
    Array.from(new Set(ids.filter(Boolean))).join(","),
  );
  queueMicrotask(() =>
    window.dispatchEvent(new Event(VERSION_UPDATE_READ_IDS_CHANGED_EVENT)),
  );
};

export const markVersionUpdateRead = (id: string) => {
  if (!id) return;
  const ids = getVersionUpdateReadIds();
  if (ids.includes(id)) return;
  setVersionUpdateReadIds([...ids, id]);
};

export const resolveWebReleaseVersion = (tagName?: string) => {
  const tag = tagName?.trim();
  if (!tag || tag === "dev") return "dev";
  return tag.replace(/^web-v/i, "").replace(/^v/i, "") || tag;
};

export const getWebBuildInfo = () => ({
  tagName: import.meta.env.VITE_RELEASE_TAG?.trim() || "dev",
  version: resolveWebReleaseVersion(import.meta.env.VITE_RELEASE_TAG),
  buildTime: import.meta.env.VITE_BUILD_TIME?.trim() || "",
});
