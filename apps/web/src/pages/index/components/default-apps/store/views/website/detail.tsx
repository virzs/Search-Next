import { Button, Image } from "antd";
import { FC, useEffect, useRef } from "react";
import { RiExternalLinkLine } from "@remixicon/react";
import { DefaultAppView, useAppRouteContext } from "@/components";
import { useLocation, useNavigate } from "react-router";
import { storeRoute } from "../../route-paths";
import { getWebsiteIconUrl, getWebsiteName, getWebsiteUrl } from "../../utils";
import { css } from "@emotion/css";
import type { StoreOutletContext } from "../../index";

const websiteDetailClassName = css`
  .apple-store-action.ant-btn-primary {
    border-color: #007aff !important;
    background: #007aff !important;
    color: #ffffff !important;
    box-shadow: 0 8px 18px rgba(0, 122, 255, 0.2);
  }
`;

const WebsiteDetailView: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { onAddStoreItem } = useAppRouteContext<StoreOutletContext>();
  const stateItem = (location.state as any)?.item ?? null;
  const itemRef = useRef<any>(stateItem);
  if (!itemRef.current && stateItem) itemRef.current = stateItem;
  const item = itemRef.current;

  useEffect(() => {
    if (!item) navigate(storeRoute.path.website.root, { replace: true });
  }, [item, navigate]);

  if (!item) return null;

  const iconUrl = getWebsiteIconUrl(item);
  const name = getWebsiteName(item);
  const url = getWebsiteUrl(item);
  const tags = Array.isArray(item?.tags) ? item.tags : [];

  return (
    <DefaultAppView
      className={`h-full ${websiteDetailClassName}`}
      animate
      contentClassName="px-4 pb-8 pt-4"
    >
      <div className="min-h-full rounded-[22px] border border-white/80 bg-white/90 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_18px_44px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.08]">
        <div className="mb-5 flex items-center gap-5 border-b border-black/[0.08] pb-5 dark:border-white/10">
          {iconUrl ? (
            <Image
              className="h-[92px]! w-[92px]! rounded-[22px] bg-white object-cover shadow-sm dark:bg-white/10"
              src={iconUrl}
              preview={false}
            />
          ) : (
            <div className="flex h-[92px] w-[92px] shrink-0 items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,#f3f4f6,#e5e7eb)] text-[42px] font-extrabold text-gray-400 dark:bg-white/10 dark:text-white/60">
              {name?.[0]?.toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1 text-left">
            <h1 className="m-0 line-clamp-1 text-[28px] font-extrabold leading-9 tracking-normal text-gray-950 dark:text-gray-50">
              {name}
            </h1>
            {url ? (
              <p className="mt-1 max-w-md break-all text-sm font-medium text-gray-500 dark:text-gray-400">
                {url}
              </p>
            ) : null}
            {tags.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag: any) => {
                  const label =
                    typeof tag === "string" ? tag : tag?.name || tag?.label;
                  if (!label) return null;
                  return (
                    <span
                      key={label}
                      className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-white/10 dark:text-gray-300"
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="primary"
              shape="round"
              className="apple-store-action h-8! px-5! font-bold!"
              onClick={() => onAddStoreItem?.({ kind: "website", site: item })}
            >
              获取
            </Button>
            {url ? (
              <Button
                shape="circle"
                icon={<RiExternalLinkLine size={18} />}
                onClick={() => window.open(url, "_blank")}
              />
            ) : null}
          </div>
        </div>

        {item.description ? (
          <div>
            <h3 className="mb-3 text-lg font-bold tracking-normal text-gray-950 dark:text-gray-50">
              关于此应用
            </h3>
            <p className="max-w-2xl leading-7 text-gray-600 dark:text-gray-300">
              {item.description}
            </p>
          </div>
        ) : null}
      </div>
    </DefaultAppView>
  );
};

export default WebsiteDetailView;
