import { useRequest } from "ahooks";
import { Button, Empty, Skeleton } from "antd";
import { FC, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import {
  getTabsWebsiteCollectionPublicList,
  getTabsWebsiteCollectionPublicWebsitesPage,
} from "@/services/website";
import { DefaultAppView, useAppRouteContext } from "@/components";
import { storeRoute } from "../../../route-paths";
import type { StoreOutletContext } from "../../../index";
import { useI18n } from "@/i18n";
import {
  getWebsiteIconUrl,
  getWebsiteDomain,
  getWebsiteId,
  getWebsiteName,
} from "../../../utils";

const SkeletonWebsiteGrid: React.FC<{ count: number }> = ({ count }) => {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="overflow-hidden rounded-[8px] border border-[var(--sn-separator)] bg-[var(--sn-surface)] p-3 shadow-[var(--sn-shadow)]">
          <Skeleton.Image active style={{ width: 52, height: 52, borderRadius: 12 }} />
          <div className="mt-2 px-2">
            <Skeleton
              active
              title={false}
              paragraph={{ rows: 2, width: ["85%", "65%"] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const CollectionArtwork: React.FC<{ items: any[]; accent?: string }> = ({
  items,
  accent,
}) => {
  const icons = items.map(getWebsiteIconUrl).filter(Boolean).slice(0, 9);
  return (
    <div
      className="grid h-28 w-28 shrink-0 grid-cols-3 gap-1.5 rounded-[8px] p-2.5"
      style={{ background: accent || "var(--sn-accent)" }}
    >
      {Array.from({ length: 9 }).map((_, idx) => (
        <div
          key={idx}
          className="flex items-center justify-center overflow-hidden rounded-[6px] bg-white/90"
        >
          {icons[idx] ? (
            <img src={icons[idx]} alt="" className="h-full w-full object-cover" />
          ) : (
          <span className="text-xs font-semibold text-black/30">•</span>
          )}
        </div>
      ))}
    </div>
  );
};

const WebsiteListRow: React.FC<{
  item: any;
  onAdd: (item: any) => void;
  onOpen: (item: any) => void;
}> = ({ item, onAdd, onOpen }) => {
  const { t } = useI18n();
  const icon = getWebsiteIconUrl(item);
  const name = getWebsiteName(item);
  const domain = getWebsiteDomain(item);
  const category = item?.classify?.name || item?.category?.name || item?.categoryName;
  return (
    <div
      className="group flex cursor-pointer items-center gap-3 border-b border-[var(--sn-separator)] py-3 last:border-b-0"
      onClick={() => onOpen(item)}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-[var(--sn-surface-secondary)]">
        {icon ? (
          <img src={icon} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-lg font-extrabold text-gray-400">
            {name?.[0]?.toUpperCase()}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1 text-left">
        <div className="truncate text-[14px] font-semibold leading-5 text-[var(--sn-text)]">
          {name}
        </div>
        {category || domain ? (
          <div className="mt-0.5 truncate text-[12px] leading-[18px] text-[var(--sn-text-secondary)]">
            {category || domain}
          </div>
        ) : null}
      </div>
      <Button
        type="primary"
        size="small"
        shape="round"
        className="h-7! shrink-0 px-4! text-xs! font-bold!"
        onClick={(e) => {
          e.stopPropagation();
          onAdd(item);
        }}
      >
        {t("ui.get")}
      </Button>
    </div>
  );
};

const WebsiteCollectionRoute: FC = () => {
  const { t } = useI18n();
  const { id } = useParams();
  const collectionId = id ? decodeURIComponent(id) : "";
  const navigate = useNavigate();
  const { onAddStoreItem } = useAppRouteContext<StoreOutletContext>();

  const { data: collectionListData, run: runCollectionList } = useRequest(
    getTabsWebsiteCollectionPublicList,
    { manual: true },
  );
  const {
    data: collectionWebsitesData,
    loading: collectionWebsitesLoading,
    run: runCollectionWebsites,
  } = useRequest(getTabsWebsiteCollectionPublicWebsitesPage as any, {
    manual: true,
  });

  useEffect(() => {
    runCollectionList({});
  }, [runCollectionList]);

  useEffect(() => {
    runCollectionWebsites(collectionId, { page: 1, pageSize: 1000 });
  }, [collectionId, runCollectionWebsites]);

  const collectionItems = useMemo(
    () => (collectionListData as any[]) || [],
    [collectionListData],
  );
  const activeCollection = useMemo(
    () =>
      (collectionWebsitesData as any)?.collection ||
      collectionItems.find((c: any) => c?._id === collectionId) ||
      null,
    [collectionItems, collectionId, collectionWebsitesData],
  );

  const activeCollectionWebsites = useMemo(
    () => ((collectionWebsitesData as any)?.data as any[]) || [],
    [collectionWebsitesData],
  );
  const activeCollectionTotal = useMemo(
    () => (collectionWebsitesData as any)?.total ?? 0,
    [collectionWebsitesData],
  );

  const handleAddFromCard = (item: any) => {
    onAddStoreItem?.({ kind: "website", site: item });
  };

  const handleOpenWebsiteDetail = (item: any) => {
    const websiteId = getWebsiteId(item);
    navigate(storeRoute.path.website.detail(websiteId), {
      state: { item },
    });
  };

  return (
    <DefaultAppView
      className="h-full"
      animate
      contentClassName="px-4 pb-6 pt-4"
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-5 rounded-[8px] border border-[var(--sn-separator)] bg-[var(--sn-surface)] p-5 shadow-[var(--sn-shadow)] max-[560px]:items-start">
          <div className="min-w-0">
            {activeCollection?.kicker ? (
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--sn-accent)]">
                {activeCollection.kicker}
              </div>
            ) : null}
            {activeCollection?.title ? (
              <div className="line-clamp-2 text-[28px] font-bold leading-[34px] tracking-normal text-[var(--sn-text)]">
                {activeCollection.title}
              </div>
            ) : (
              <Skeleton.Input active size="large" style={{ width: 180 }} />
            )}
            {activeCollection?.description ? (
              <div className="mt-2 line-clamp-3 text-[13px] leading-5 text-[var(--sn-text-secondary)]">
                {activeCollection.description}
              </div>
            ) : null}
            <div className="mt-3 text-[12px] font-medium text-[var(--sn-text-tertiary)]">
              {t("ui.storeItemCount", { count: activeCollectionTotal })}
            </div>
          </div>
          <CollectionArtwork
            items={activeCollectionWebsites}
            accent={activeCollection?.accentColor}
          />
        </div>

        {collectionWebsitesLoading ? (
          <SkeletonWebsiteGrid count={6} />
        ) : (
          <>
            <div className="rounded-[8px] border border-[var(--sn-separator)] bg-[var(--sn-surface)] px-4 shadow-[var(--sn-shadow)]">
              {activeCollectionWebsites.map((item: any) => (
                <WebsiteListRow
                  key={getWebsiteId(item)}
                  item={item}
                  onAdd={handleAddFromCard}
                  onOpen={handleOpenWebsiteDetail}
                />
              ))}
            </div>
            {activeCollectionWebsites.length === 0 && (
              <Empty className="mt-8" description={t("ui.noData")} />
            )}
          </>
        )}
      </div>
    </DefaultAppView>
  );
};

export default WebsiteCollectionRoute;
