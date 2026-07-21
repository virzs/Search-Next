import { RiExternalLinkLine } from "@remixicon/react";
import { useI18n } from "@/i18n";
import type { WallpaperApiItem } from "@/services/desktop";

interface ApplicationWallpaperMetadataProps {
  wallpaper: WallpaperApiItem;
}

const ApplicationWallpaperMetadata = ({
  wallpaper,
}: ApplicationWallpaperMetadataProps) => {
  const { t } = useI18n();
  const application = wallpaper.application;
  const description =
    wallpaper.description ||
    application?.description ||
    t(
      wallpaper.type === "application"
        ? "ui.applicationWallpaper"
        : "ui.imageWallpaper",
    );
  const author = wallpaper.author || application?.author;
  const projectUrl = wallpaper.url || application?.projectUrl;

  return (
    <div className="min-w-0">
      <div className="line-clamp-2 text-[12px] leading-[18px] text-[var(--sn-text-secondary)]">
        {description}
      </div>
      {author || projectUrl ? (
        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-[11px] leading-4 text-[var(--sn-text-tertiary)]">
          {author ? (
            <span className="truncate">
              {t("ui.author")} · {author}
            </span>
          ) : null}
          {projectUrl ? (
            <a
              href={projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1 font-medium text-[var(--sn-accent-text)] outline-none hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sn-accent)]"
              title={projectUrl}
              onClick={(event) => event.stopPropagation()}
            >
              {t("ui.source")}
              <RiExternalLinkLine size={12} aria-hidden="true" />
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default ApplicationWallpaperMetadata;
