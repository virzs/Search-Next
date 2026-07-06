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
  getWebsiteId,
  getWebsiteName,
  getWebsiteUrl,
} from "../../../utils";

const SkeletonWebsiteGrid: React.FC<{ count: number }> = ({ count }) => {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_10px_26px_rgba(15,23,42,0.06)]">
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
      className="grid h-32 w-32 shrink-0 grid-cols-3 gap-2 rounded-[30px] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.42)]"
      style={{ background: accent || "#007aff" }}
    >
      {Array.from({ length: 9 }).map((_, idx) => (
        <div
          key={idx}
          className="flex items-center justify-center overflow-hidden rounded-xl bg-white/85 shadow-sm"
        >
          {icons[idx] ? (
            <img src={icons[idx]} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-white/45" />
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
  const url = getWebsiteUrl(item);
  return (
    <div
      className="group flex cursor-pointer items-center gap-3 border-b border-black/[0.06] py-3 last:border-b-0 dark:border-white/10"
      onClick={() => onOpen(item)}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#f2f2f7] shadow-sm dark:bg-white/10">
        {icon ? (
          <img src={icon} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-lg font-extrabold text-gray-400">
            {name?.[0]?.toUpperCase()}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1 text-left">
        <div className="truncate text-sm font-bold text-gray-950 dark:text-gray-50">
          {name}
        </div>
        {url ? (
          <div className="mt-0.5 truncate text-xs font-medium text-gray-500">
            {url}
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
        <div className="mb-5 flex items-end justify-between gap-5 rounded-[28px] bg-white/80 p-5 shadow-[0_16px_38px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] dark:bg-white/[0.08]">
          <div className="min-w-0">
            {activeCollection?.kicker ? (
              <div className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#0071e3]">
                {activeCollection.kicker}
              </div>
            ) : null}
            {activeCollection?.title ? (
              <div className="line-clamp-2 text-[34px] font-extrabold leading-10 tracking-normal text-gray-950 dark:text-gray-50">
                {activeCollection.title}
              </div>
            ) : (
              <Skeleton.Input active size="large" style={{ width: 180 }} />
            )}
            {activeCollection?.description ? (
              <div className="mt-2 line-clamp-3 text-sm font-semibold leading-6 text-gray-500 dark:text-gray-400">
                {activeCollection.description}
              </div>
            ) : null}
            <div className="mt-3 text-xs font-bold text-gray-400">
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
            <div className="rounded-[24px] bg-white/85 px-4 shadow-[0_12px_28px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] dark:bg-white/[0.08]">
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
