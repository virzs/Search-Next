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
    className="grid h-28 w-28 shrink-0 grid-cols-3 gap-1.5 rounded-[8px] p-2.5"
    style={{ background: accent || "var(--sn-accent)" }}
  >
    {Array.from({ length: 9 }).map((_, idx) => {
      const app = items[idx];
      const icon = app ? getAppIconUrl(app) : "";
      return (
        <div
          key={idx}
          className="flex items-center justify-center overflow-hidden rounded-[6px] bg-white/90"
        >
          {icon ? (
            <img src={icon} alt="" className="h-full w-full object-contain p-1.5" />
          ) : (
            <RiApps2Line className="text-lg text-black/30" />
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
    <div className="flex items-center gap-3 border-b border-[var(--sn-separator)] py-3 last:border-b-0">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-[var(--sn-surface-secondary)]">
        {icon ? (
          <img src={icon} alt={name} className="h-full w-full object-contain p-2.5" />
        ) : (
          <RiApps2Line className="text-2xl text-[var(--sn-accent)]" />
        )}
      </div>
      <div className="min-w-0 flex-1 text-left">
        <div className="truncate text-[14px] font-semibold leading-5 text-[var(--sn-text)]">
          {name}
        </div>
        {description ? (
          <div className="mt-0.5 line-clamp-1 text-[12px] leading-[18px] text-[var(--sn-text-secondary)]">
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
          <div className="rounded-[8px] border border-[var(--sn-separator)] bg-[var(--sn-surface)] p-4">
            <Skeleton active avatar paragraph={{ rows: 5 }} />
          </div>
        ) : (
          <>
            <div className="rounded-[8px] border border-[var(--sn-separator)] bg-[var(--sn-surface)] px-4 shadow-[var(--sn-shadow)]">
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
