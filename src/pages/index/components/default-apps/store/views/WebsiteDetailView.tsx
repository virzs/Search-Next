import { Button, Image } from "antd";
import { FC } from "react";
import { RiArrowLeftLine, RiExternalLinkLine } from "@remixicon/react";
import { getWebsiteIconUrl, getWebsiteName, getWebsiteUrl } from "../utils";

interface WebsiteDetailViewProps {
  item: any;
  onBack: () => void;
  onAdd: (item: any) => void;
}

const WebsiteDetailView: FC<WebsiteDetailViewProps> = ({ item, onBack, onAdd }) => {
  if (!item) return null;

  const iconUrl = getWebsiteIconUrl(item);
  const name = getWebsiteName(item);
  const url = getWebsiteUrl(item);

  return (
    <div className="h-full flex flex-col bg-(--store-bg-content) overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header / Nav */}
      <div className="shrink-0 flex items-center gap-2 p-4 pb-2">
        <Button
          type="text"
          className="rounded-full! text-(--store-text-secondary)! hover:bg-(--store-border)! hover:text-(--store-text-primary)!"
          icon={<RiArrowLeftLine size={20} />}
          onClick={onBack}
        >
          返回
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6 pt-0">
          {/* Hero Section */}
          <div className="flex flex-col items-center text-center mb-8 pt-8">
            <div className="relative mb-6">
              {iconUrl ? (
                <Image
                  className="w-32! h-32! rounded-3xl shadow-xl border-4 border-(--store-bg-card) bg-white"
                  src={iconUrl}
                  preview={false}
                />
              ) : (
                <div className="w-32 h-32 rounded-3xl shadow-xl border-4 border-(--store-bg-card) bg-gray-100 flex items-center justify-center text-5xl font-bold text-gray-400">
                  {name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>

            <h1 className="text-3xl font-bold text-(--store-text-primary) mb-2">{name}</h1>
            <p className="text-(--store-text-secondary) text-sm mb-6 max-w-md break-all">{url}</p>

            <div className="flex gap-4 w-full max-w-xs">
              <Button
                type="primary"
                size="large"
                className="flex-1 rounded-full! h-12! text-base! font-semibold! shadow-lg shadow-blue-500/20 bg-(--store-primary)!"
                onClick={() => onAdd(item)}
              >
                获取
              </Button>
              <Button
                size="large"
                className="rounded-full! w-12! h-12! flex items-center justify-center border-(--store-border)! text-(--store-text-primary)! hover:bg-(--store-bg-card)!"
                icon={<RiExternalLinkLine size={20} />}
                onClick={() => window.open(url, "_blank")}
              />
            </div>
          </div>

          <div className="border-t border-(--store-border) pt-8">
            <h3 className="text-lg font-bold text-(--store-text-primary) mb-4">关于此应用</h3>
            <div className="bg-(--store-bg-card) rounded-2xl p-6 border border-(--store-border)">
              <p className="text-(--store-text-secondary) leading-relaxed">
                这是一个简单快捷的网站快捷方式。添加到桌面后，您可以快速访问此网站。我们致力于为您提供最优质的网页应用体验。
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {item?.tags?.map((tag: any) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-(--store-border) text-(--store-text-secondary) text-xs"
                  >
                    {typeof tag === "string" ? tag : tag.name || tag.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Images Placeholder (Optional) */}
          <div className="mt-8">
            <h3 className="text-lg font-bold text-(--store-text-primary) mb-4">预览</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-64 h-40 shrink-0 rounded-2xl bg-(--store-bg-card) border border-(--store-border) flex items-center justify-center text-(--store-text-tertiary)"
                >
                  预览图 {i}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteDetailView;
