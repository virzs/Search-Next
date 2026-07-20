import type { ProjectPublicInfo } from "@/services/system";
import { DEFAULT_THEME_COLOR } from "@/theme/color";
import { toBackendAssetUrl } from "./utils";

export const DEFAULT_SITE_NAME = "Search Next";
export const DEFAULT_SITE_FAVICON = "/favicon.png";

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

export const applyWebSiteMetadata = (project?: ProjectPublicInfo | null) => {
  const icon = project?.site?.icon;
  const favicon = upsertFavicon();
  const iconUrl = icon?.url
    ? toBackendAssetUrl(icon.url)
    : DEFAULT_SITE_FAVICON;

  document.title = project?.name?.trim() || DEFAULT_SITE_NAME;
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
    project?.site?.themeColor || DEFAULT_THEME_COLOR;
};
