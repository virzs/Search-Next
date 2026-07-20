import { useState, type FC } from "react";
import { RiGlobalLine } from "@remixicon/react";
import { getWebsiteDomain, getWebsiteIconUrl, getWebsiteName } from "../utils";
import { css, cx } from "@emotion/css";
import { useI18n } from "@/i18n";
import StoreGetButton from "./StoreGetButton";

interface WebsiteCardProps {
  item: any;
  onAdd: (item: any) => void;
  onClick: (item: any) => void;
  layout?: "list" | "grid";
  variant?: "normal" | "small";
}

const WebsiteCard: FC<WebsiteCardProps> = ({
  item,
  onAdd,
  onClick,
  layout = "grid",
  variant = "normal",
}) => {
  const { t } = useI18n();
  const [imageFailed, setImageFailed] = useState(false);
  const iconUrl = getWebsiteIconUrl(item);
  const name = getWebsiteName(item) || t("ui.websites");
  const domain = getWebsiteDomain(item);
  const category = item?.classify?.name || item?.category?.name || item?.categoryName;
  const metadata = category || domain || t("ui.websites");
  const isSmall = variant === "small";
  const isCompactLayout = isSmall || layout === "list";

  return (
    <article
      className={cx(
        websiteCardClassName,
        layout === "grid"
          ? isSmall
            ? "flex min-h-[76px] flex-row items-center gap-3 p-3"
            : "flex min-h-[164px] flex-col items-stretch gap-3 p-4"
          : "flex min-h-[72px] items-center gap-3 p-3",
      )}
    >
      <button
        type="button"
        aria-label={name}
        className={cx(
          "flex min-w-0 cursor-pointer border-0 bg-transparent p-0 text-left text-inherit transition-transform duration-100 active:scale-[0.99] focus-visible:rounded-[var(--sn-radius-control)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sn-accent)]",
          isCompactLayout
            ? "flex-1 items-center gap-3"
            : "w-full flex-col items-start gap-3",
        )}
        onClick={() => onClick(item)}
      >
        <div
          className={cx(
            "grid shrink-0 place-items-center overflow-hidden rounded-[var(--sn-radius-control)] border border-[var(--sn-separator)] bg-[var(--sn-surface-secondary)] text-[var(--sn-text-tertiary)]",
            isCompactLayout ? "h-[46px] w-[46px]" : "h-[52px] w-[52px]",
          )}
        >
          {iconUrl && !imageFailed ? (
            <img
              src={iconUrl}
              alt=""
              className="h-full w-full object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : name.trim().charAt(0) ? (
            <span className="text-lg font-bold">
              {name.trim().charAt(0).toUpperCase()}
            </span>
          ) : (
            <RiGlobalLine size={20} />
          )}
        </div>

        <div
          className={cx(
            "min-w-0 flex-1 text-left",
            isCompactLayout ? null : "w-full",
          )}
        >
          <div className="line-clamp-1 text-[14px] font-semibold leading-5 text-[var(--sn-text)]">
            {name}
          </div>
          <div className="mt-1 truncate text-[12px] font-medium leading-4 text-[var(--sn-text-secondary)]">
            {metadata}
          </div>
        </div>
      </button>

      <div
        className={cx(
          layout === "grid" && !isSmall
            ? "mt-auto flex w-full justify-end pt-1"
            : "ml-auto shrink-0 self-center",
        )}
      >
        <StoreGetButton onClick={() => onAdd(item)}>
          {t("ui.get")}
        </StoreGetButton>
      </div>
    </article>
  );
};

export default WebsiteCard;

const websiteCardClassName = css`
  overflow: hidden;
  border: 1px solid var(--sn-separator);
  border-radius: var(--sn-radius-surface);
  background: var(--sn-surface);
  box-shadow: var(--sn-shadow);
  transition:
    transform 160ms ease,
    background-color 160ms ease,
    border-color 160ms ease;

  &:hover {
    border-color: color-mix(in srgb, var(--sn-accent) 28%, var(--sn-separator));
    background: var(--sn-surface-strong);
    transform: translateY(-1px);
  }

  &:focus-within {
    border-color: color-mix(in srgb, var(--sn-accent) 38%, var(--sn-separator));
  }
`;
