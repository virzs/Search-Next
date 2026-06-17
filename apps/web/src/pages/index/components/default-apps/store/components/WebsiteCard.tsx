import { Button, Image } from "antd";
import { FC } from "react";
import { getWebsiteIconUrl, getWebsiteName, getWebsiteUrl } from "../utils";
import { css, cx } from "@emotion/css";

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
  const iconUrl = getWebsiteIconUrl(item);
  const name = getWebsiteName(item);
  const url = getWebsiteUrl(item);

  const isSmall = variant === "small";

  return (
    <div
      className={cx(
        websiteCardClassName,
        "group relative cursor-pointer bg-white transition-all duration-200 hover:-translate-y-0.5",
        layout === "grid"
          ? isSmall
            ? "flex min-h-[74px] flex-row items-center! gap-3 rounded-2xl p-3"
            : "flex min-h-[164px] flex-col items-start! gap-3 rounded-2xl p-3"
          : "flex items-center gap-3 rounded-2xl p-3",
      )}
      onClick={() => onClick(item)}
    >
      <div
        className={cx(
          "shrink-0 relative",
          layout === "grid"
            ? isSmall
              ? "w-[46px] h-[46px]"
              : "w-[52px] h-[52px]"
            : "w-[46px] h-[46px]",
        )}
      >
        {iconUrl ? (
          <Image
            className="w-full! h-full! rounded-xl object-cover shadow-sm"
            src={iconUrl}
            preview={false}
            fallback="https://via.placeholder.com/64"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-xl bg-[linear-gradient(135deg,#f3f4f6,#e5e7eb)] text-xl font-bold text-gray-400">
            {name?.[0]?.toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 text-left w-full">
        <div
          className={cx(
            "truncate font-bold tracking-normal text-gray-950 dark:text-gray-50",
            layout === "grid" ? (isSmall ? "text-sm" : "text-base") : "text-sm",
          )}
        >
          {name}
        </div>
        {url ? (
          <div className="mt-1 truncate text-xs font-medium text-gray-500 dark:text-gray-400">
            {url}
          </div>
        ) : null}
      </div>
      <div
        className={cx(
          layout === "grid"
            ? isSmall
              ? "shrink-0 ml-auto self-center"
              : "w-full mt-auto pt-1"
            : "shrink-0",
        )}
      >
        <Button
          type="primary"
          size="small"
          shape="round"
          block={layout === "grid" && !isSmall}
          className="store-get-button"
          onClick={(e) => {
            e.stopPropagation();
            onAdd(item);
          }}
        >
          获取
        </Button>
      </div>
    </div>
  );
};

export default WebsiteCard;

const websiteCardClassName = css`
  border: 1px solid rgba(0, 0, 0, 0.07);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.82),
    0 10px 26px rgba(15, 23, 42, 0.06);

  &:hover {
    border-color: rgba(0, 113, 227, 0.18);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.9),
      0 14px 30px rgba(15, 23, 42, 0.09);
  }

  .ant-image,
  .ant-image-img {
    display: block;
  }

  .store-get-button {
    height: 28px;
    border: 0;
    padding: 0 14px;
    font-size: 12px;
    font-weight: 800;
  }
`;
