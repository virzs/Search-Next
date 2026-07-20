import {
  DEFAULT_PROJECT_THEME_COLOR,
  type ProjectPublicData,
} from "@/services/system/project";

export const DEFAULT_SITE_NAME = "Search Next";
export const DEFAULT_SITE_FAVICON = "/favicon.png";

const getBackendOrigin = () => {
  const env = import.meta.env as Record<string, string | undefined>;
  const configuredOrigin = env.VITE_API_ORIGIN || env.VITE_API_PROXY_TARGET;
  if (configuredOrigin) return configuredOrigin.replace(/\/+$/, "");
  if (import.meta.env.DEV) return "http://localhost:5151";
  return window.location.origin;
};

const toBackendAssetUrl = (entry?: string | null) => {
  if (!entry) return DEFAULT_SITE_FAVICON;
  if (entry.startsWith("http://") || entry.startsWith("https://")) return entry;
  if (entry.startsWith("//")) return `${window.location.protocol}${entry}`;
  const normalized = entry.startsWith("/") ? entry : `/${entry}`;
  if (normalized.startsWith("/static/") || normalized.startsWith("/uploads/")) {
    return new URL(normalized, getBackendOrigin()).href;
  }
  return new URL(normalized, window.location.origin).href;
};

const upsertMeta = (name: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[name="${name}"]`,
  );
  if (!element) {
    element = document.createElement("meta");
    element.name = name;
    document.head.appendChild(element);
  }
  return element;
};

const upsertFavicon = () => {
  let element = document.head.querySelector<HTMLLinkElement>(
    'link[rel="icon"]',
  );
  if (!element) {
    element = document.createElement("link");
    element.rel = "icon";
    document.head.appendChild(element);
  }
  return element;
};

export const applyAdminSiteMetadata = (project?: ProjectPublicData | null) => {
  const name = project?.name?.trim() || DEFAULT_SITE_NAME;
  const icon = project?.site?.icon;
  const favicon = upsertFavicon();

  document.title = `${name} - 管理后台`;
  const iconUrl = toBackendAssetUrl(icon?.url);
  favicon.dataset.source = iconUrl;
  favicon.href = iconUrl;
  favicon.type = icon?.mimetype || "image/png";
  if (icon?.url) {
    const probe = new Image();
    probe.onerror = () => {
      if (favicon.dataset.source === iconUrl) {
        favicon.dataset.source = DEFAULT_SITE_FAVICON;
        favicon.href = DEFAULT_SITE_FAVICON;
        favicon.type = "image/png";
      }
    };
    probe.src = iconUrl;
  }
  upsertMeta("theme-color").content =
    project?.site?.themeColor || DEFAULT_PROJECT_THEME_COLOR;
};
