import { Button } from "antd";
import { useState, type FC } from "react";
import { RiGlobalLine } from "@remixicon/react";
import { getWebsiteDomain, getWebsiteIconUrl, getWebsiteName } from "../utils";
import { css, cx } from "@emotion/css";
import { useI18n } from "@/i18n";

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

  return (
    <article
      className={cx(
        websiteCardClassName,
        layout === "grid"
          ? isSmall
            ? "flex min-h-[76px] flex-row items-center gap-3 p-3"
            : "flex min-h-[164px] flex-col items-start gap-3 p-4"
          : "flex min-h-[72px] items-center gap-3 p-3",
      )}
      onClick={() => onClick(item)}
    >
      <div
        className={cx(
          "grid shrink-0 place-items-center overflow-hidden rounded-[8px] border border-[var(--sn-separator)] bg-[var(--sn-surface-secondary)] text-[var(--sn-text-tertiary)]",
          isSmall || layout === "list" ? "h-[46px] w-[46px]" : "h-[52px] w-[52px]",
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
          <span className="text-lg font-bold">{name.trim().charAt(0).toUpperCase()}</span>
        ) : (
          <RiGlobalLine size={20} />
        )}
      </div>

      <div className="min-w-0 flex-1 text-left">
        <div className="line-clamp-1 text-[14px] font-semibold leading-5 text-[var(--sn-text)]">
          {name}
        </div>
        <div className="mt-1 truncate text-[12px] font-medium leading-4 text-[var(--sn-text-secondary)]">
          {metadata}
        </div>
      </div>

      <div
        className={cx(
          layout === "grid" && !isSmall
            ? "mt-auto w-full pt-1"
            : "ml-auto shrink-0 self-center",
        )}
      >
        <Button
          type="primary"
          size="small"
          shape="round"
          block={layout === "grid" && !isSmall}
          className="h-7! px-3! text-[12px]! font-semibold!"
          onClick={(event) => {
            event.stopPropagation();
            onAdd(item);
          }}
        >
          {t("ui.get")}
        </Button>
      </div>
    </article>
  );
};

export default WebsiteCard;

const websiteCardClassName = css`
  cursor: pointer;
  overflow: hidden;
  border: 1px solid var(--sn-separator);
  border-radius: 8px;
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

  &:active {
    transform: translateY(0) scale(0.99);
  }
`;
