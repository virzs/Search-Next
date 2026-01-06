import { Image, Button } from "antd";
import { FC } from "react";
import { getWebsiteIconUrl, getWebsiteName, getWebsiteUrl } from "../utils";

interface WebsiteCardProps {
  item: any;
  onAdd: (item: any) => void;
  onClick: (item: any) => void;
  layout?: "list" | "grid";
  variant?: "normal" | "small";
}

const WebsiteCard: FC<WebsiteCardProps> = ({ item, onAdd, onClick, layout = "grid", variant = "normal" }) => {
  const iconUrl = getWebsiteIconUrl(item);
  const name = getWebsiteName(item);
  const url = getWebsiteUrl(item);

  const isSmall = variant === "small";

  return (
    <div
      className={`group relative flex items-center gap-3 rounded-2xl  border   hover: transition-all duration-200 cursor-pointer ${
        layout === "grid" ? (isSmall ? "flex-row items-center! p-3 gap-3" : "flex-col items-start! p-4 gap-4") : "p-3"
      }`}
      onClick={() => onClick(item)}
    >
      <div className={`shrink-0 relative ${layout === "grid" ? (isSmall ? "w-12 h-12" : "w-16 h-16") : "w-12 h-12"}`}>
        {iconUrl ? (
          <Image
            className="w-full! h-full! rounded-xl object-cover shadow-sm"
            src={iconUrl}
            preview={false}
            fallback="https://via.placeholder.com/64"
          />
        ) : (
          <div className="w-full h-full rounded-xl bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 font-bold text-xl">
            {name?.[0]?.toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 text-left w-full">
        <div
          className={`font-semibold  truncate ${
            layout === "grid" ? (isSmall ? "text-sm" : "text-base") : "text-sm"
          }`}
        >
          {name}
        </div>
        <div className="text-xs  truncate mt-0.5">{url || "无描述"}</div>
      </div>

      <div
        className={`${
          layout === "grid" ? (isSmall ? "shrink-0 ml-auto self-center" : "w-full mt-auto pt-1") : "shrink-0"
        }`}
      >
        <Button
          type="primary"
          size={isSmall ? "small" : layout === "grid" ? "middle" : "small"}
          block={layout === "grid" && !isSmall}
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
