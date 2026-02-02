import { NOTICE_READ_IDS_STORAGE_KEY } from "./storage";

export const getNoticeReadIds = () => {
  const raw = localStorage.getItem(NOTICE_READ_IDS_STORAGE_KEY);
  if (!raw) return [] as string[];
  const parts = raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  return Array.from(new Set(parts));
};

export const setNoticeReadIds = (ids: string[]) => {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  return localStorage.setItem(NOTICE_READ_IDS_STORAGE_KEY, unique.join(","));
};

export const removeNoticeReadIds = () => {
  return localStorage.removeItem(NOTICE_READ_IDS_STORAGE_KEY);
};
