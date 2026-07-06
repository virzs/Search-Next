import { useRequest } from "ahooks";
import { Button, Empty, Skeleton } from "antd";
import { FC, useEffect, useMemo } from "react";
import { useParams } from "react-router";
import {
  getTabsAppCollectionPublicList,
  getTabsAppCollectionPublicAppsPage,
} from "@/services/app";
import { DefaultAppView, useAppRouteContext } from "@/components";
import type { StoreOutletContext } from "../../../index";
import { useI18n } from "@/i18n";
import { useApp } from "@/hooks/useApp";
import type { AppApiItem } from "@/types";
import { RiApps2Line } from "@remixicon/react";
import {
  resolveAppDescription,
  resolveAppDisplayName,
} from "@/i18n";

const CollectionArtwork: React.FC<{
  items: AppApiItem[];
  accent?: string;
  getAppIconUrl: (app: AppApiItem) => string | null;
}> = ({ items, accent, getAppIconUrl }) => (
  <div
    className="grid h-32 w-32 shrink-0 grid-cols-3 gap-2 rounded-[30px] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.42)]"
    style={{ background: accent || "#007aff" }}
  >
    {Array.from({ length: 9 }).map((_, idx) => {
      const app = items[idx];
      const icon = app ? getAppIconUrl(app) : "";
      return (
        <div
          key={idx}
          className="flex items-center justify-center overflow-hidden rounded-xl bg-white/85 shadow-sm"
        >
          {icon ? (
            <img src={icon} alt="" className="h-full w-full object-contain p-1.5" />
          ) : (
            <RiApps2Line className="text-lg text-blue-500" />
          )}
        </div>
      );
    })}
  </div>
);

const AppListRow: React.FC<{
  item: AppApiItem;
  getAppIconUrl: (app: AppApiItem) => string | null;
  onAdd: (item: AppApiItem) => void;
}> = ({ item, getAppIconUrl, onAdd }) => {
  const { t, language } = useI18n();
  const icon = getAppIconUrl(item);
  const name = resolveAppDisplayName(item, language);
  const description = resolveAppDescription(item, language);
  return (
    <div className="flex items-center gap-3 border-b border-black/[0.06] py-3 last:border-b-0 dark:border-white/10">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#f2f2f7] shadow-sm dark:bg-white/10">
        {icon ? (
          <img src={icon} alt={name} className="h-full w-full object-contain p-2.5" />
        ) : (
          <RiApps2Line className="text-2xl text-blue-500" />
        )}
      </div>
      <div className="min-w-0 flex-1 text-left">
        <div className="truncate text-sm font-bold text-gray-950 dark:text-gray-50">
          {name}
        </div>
        {description ? (
          <div className="mt-0.5 line-clamp-1 text-xs font-medium text-gray-500">
            {description}
          </div>
        ) : null}
      </div>
      <Button
        type="primary"
        size="small"
        shape="round"
        className="h-7! shrink-0 px-4! text-xs! font-bold!"
        onClick={() => onAdd(item)}
      >
        {t("ui.get")}
      </Button>
    </div>
  );
};

const AppCollectionRoute: FC = () => {
  const { t } = useI18n();
  const { id } = useParams();
  const collectionId = id ? decodeURIComponent(id) : "";
  const { onAddStoreItem } = useAppRouteContext<StoreOutletContext>();
  const { getAppIconUrl, refresh } = useApp();

  const { data: collectionListData, run: runCollectionList } = useRequest(
    getTabsAppCollectionPublicList,
    { manual: true },
  );
  const {
    data: collectionAppsData,
    loading: collectionAppsLoading,
    run: runCollectionApps,
  } = useRequest(getTabsAppCollectionPublicAppsPage as any, {
    manual: true,
  });

  useEffect(() => {
    void refresh();
    runCollectionList({});
  }, [refresh, runCollectionList]);

  useEffect(() => {
    runCollectionApps(collectionId, { page: 1, pageSize: 1000 });
  }, [collectionId, runCollectionApps]);

  const collectionItems = useMemo(
    () => (collectionListData as any[]) || [],
    [collectionListData],
  );
  const activeCollection = useMemo(
    () =>
      (collectionAppsData as any)?.collection ||
      collectionItems.find((c: any) => c?._id === collectionId) ||
      null,
    [collectionItems, collectionId, collectionAppsData],
  );
  const apps = useMemo(
    () =>
      (((collectionAppsData as any)?.data as AppApiItem[]) || []).filter(
        (item) =>
          Boolean(item.configSnapshot?.supportAppMode ?? item.supportAppMode),
      ),
    [collectionAppsData],
  );
  const total = useMemo(
    () => apps.length,
    [apps.length],
  );

  const handleAdd = (item: AppApiItem) => {
    onAddStoreItem?.({
      kind: "app",
      appId: item._id,
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
              {t("ui.storeItemCount", { count: total })}
            </div>
          </div>
          <CollectionArtwork
            items={apps}
            accent={activeCollection?.accentColor}
            getAppIconUrl={getAppIconUrl}
          />
        </div>

        {collectionAppsLoading ? (
          <div className="rounded-[24px] bg-white/85 p-4 dark:bg-white/[0.08]">
            <Skeleton active avatar paragraph={{ rows: 5 }} />
          </div>
        ) : (
          <>
            <div className="rounded-[24px] bg-white/85 px-4 shadow-[0_12px_28px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] dark:bg-white/[0.08]">
              {apps.map((item) => (
                <AppListRow
                  key={item._id}
                  item={item}
                  getAppIconUrl={getAppIconUrl}
                  onAdd={handleAdd}
                />
              ))}
            </div>
            {apps.length === 0 ? (
              <Empty className="mt-8" description={t("ui.noApps")} />
            ) : null}
          </>
        )}
      </div>
    </DefaultAppView>
  );
};

export default AppCollectionRoute;
