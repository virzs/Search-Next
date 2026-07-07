export const getBackendOrigin = () => {
  const env = import.meta.env as Record<string, string | undefined>;
  const configuredOrigin = env.VITE_API_ORIGIN || env.VITE_API_PROXY_TARGET;
  if (configuredOrigin) return configuredOrigin.replace(/\/+$/, "");
  if (import.meta.env.DEV) return "http://localhost:5151";
  return window.location.origin;
};

export const toBackendAssetUrl = (entry?: string | null) => {
  if (!entry) return "";
  if (entry.startsWith("http://") || entry.startsWith("https://")) {
    return entry;
  }
  if (entry.startsWith("//")) return `${window.location.protocol}${entry}`;
  const normalized = entry.startsWith("/") ? entry : `/${entry}`;
  if (normalized.startsWith("/static/") || normalized.startsWith("/uploads/")) {
    return new URL(normalized, getBackendOrigin()).href;
  }
  return new URL(normalized, window.location.origin).href;
};
