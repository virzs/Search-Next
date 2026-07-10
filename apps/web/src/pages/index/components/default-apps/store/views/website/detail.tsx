import { Button, Image } from "antd";
import { FC, useEffect, useRef } from "react";
import { RiExternalLinkLine } from "@remixicon/react";
import { DefaultAppView, useAppRouteContext } from "@/components";
import { useLocation, useNavigate } from "react-router";
import { storeRoute } from "../../route-paths";
import { getWebsiteDomain, getWebsiteIconUrl, getWebsiteName, getWebsiteUrl } from "../../utils";
import type { StoreOutletContext } from "../../index";
import { useI18n } from "@/i18n";

const WebsiteDetailView: FC = () => {
  const { t } = useI18n();
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
  const domain = getWebsiteDomain(item);
  const tags = Array.isArray(item?.tags) ? item.tags : [];

  return (
    <DefaultAppView
      className="h-full"
      animate
      contentClassName="px-4 pb-8 pt-4"
    >
      <div className="min-h-full rounded-[8px] border border-[var(--sn-separator)] bg-[var(--sn-surface)] p-5 shadow-[var(--sn-shadow)]">
        <div className="mb-5 flex items-center gap-5 border-b border-[var(--sn-separator)] pb-5 max-[560px]:items-start">
          {iconUrl ? (
            <Image
              className="h-[88px]! w-[88px]! rounded-[8px] bg-[var(--sn-surface-secondary)] object-cover"
              src={iconUrl}
              preview={false}
            />
          ) : (
            <div className="flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-[8px] bg-[var(--sn-surface-secondary)] text-[36px] font-bold text-[var(--sn-text-tertiary)]">
              {name?.[0]?.toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1 text-left">
            <h1 className="m-0 line-clamp-2 text-[28px] font-bold leading-[34px] tracking-normal text-[var(--sn-text)]">
              {name}
            </h1>
            {domain ? (
              <p className="mt-1 max-w-md truncate text-[13px] leading-5 text-[var(--sn-text-secondary)]">
                {domain}
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
                      className="rounded-full bg-[var(--sn-surface-secondary)] px-3 py-1 text-[11px] font-medium text-[var(--sn-text-secondary)]"
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
              className="h-8! px-5! font-semibold!"
              onClick={() => onAddStoreItem?.({ kind: "website", site: item })}
            >
              {t("ui.get")}
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
            <h3 className="mb-3 text-[17px] font-semibold leading-[22px] tracking-normal text-[var(--sn-text)]">
              {t("ui.aboutThisApp")}
            </h3>
            <p className="max-w-2xl text-[13px] leading-5 text-[var(--sn-text-secondary)]">
              {item.description}
            </p>
          </div>
        ) : null}
      </div>
    </DefaultAppView>
  );
};

export default WebsiteDetailView;
