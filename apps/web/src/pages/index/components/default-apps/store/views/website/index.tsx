import { useRequest } from "ahooks";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Empty, Pagination, Skeleton } from "antd";
import {
  getTabsWebsiteClassifyPublicLevel1,
  getTabsWebsiteCollectionPublicList,
  getTabsWebsitePublic,
} from "@/services/website";
import { RiAddLine } from "@remixicon/react";
import { useNavigate } from "react-router";
import { getWebsiteId, type WebsiteCategory } from "../../utils";
import WebsiteCard from "../../components/WebsiteCard";
import FeaturedView from "../website/featured";
import {
  AppCategoryRail,
  DefaultAppView,
  useAppRouteContext,
} from "@/components";
import type { StoreOutletContext } from "../../index";
import AddWebsiteModal from "./add-website-modal";
import { storeRoute } from "../../route-paths";
import { useI18n } from "@/i18n";

const WebsiteGridSkeleton: React.FC<{ count: number }> = ({ count }) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="min-h-[164px] rounded-[8px] border border-[var(--sn-separator)] bg-[var(--sn-surface)] p-3 shadow-[var(--sn-shadow)]"
      >
        <Skeleton.Avatar active size={52} shape="square" />
        <Skeleton
          active
          title={false}
          paragraph={{ rows: 2, width: ["78%", "58%"] }}
          className="mt-3"
        />
      </div>
    ))}
  </div>
);

const WebsiteView: React.FC = () => {
  const { t } = useI18n();
  const { onAddStoreItem, query } = useAppRouteContext<StoreOutletContext>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [addVisible, setAddVisible] = useState(false);
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState<string>("featured");
  const featuredHomeScrollRef = useRef<HTMLDivElement | null>(null);

  const {
    data: listData,
    loading: listLoading,
    run: runList,
  } = useRequest(getTabsWebsitePublic, { manual: true });
  const {
    data: collectionListData,
    loading: collectionListLoading,
    run: runCollectionList,
  } = useRequest(getTabsWebsiteCollectionPublicList, { manual: true });
  const { data: classifyLevel1Data, run: runClassifyLevel1 } = useRequest(
    getTabsWebsiteClassifyPublicLevel1,
    { manual: true },
  );

  const listItems = useMemo(() => (listData?.data as any[]) || [], [listData]);
  const listTotal = useMemo(
    () => (listData as any)?.total ?? (listData as any)?.count ?? 0,
    [listData],
  );
  const collectionItems = useMemo(
    () => (collectionListData as any[]) || [],
    [collectionListData],
  );

  const categories = useMemo<WebsiteCategory[]>(() => {
    const items = (classifyLevel1Data as any[]) || [];
    return items
      .filter((c) => c?._id && c?.name)
      .map((c) => ({
        key: `classify:${c._id}`,
        label: c.name,
        filter: { classify: c._id },
      }));
  }, [classifyLevel1Data]);

  const activeCategory = useMemo(() => {
    if (!activeView.startsWith("cat:")) return null;
    const key = activeView.slice("cat:".length);
    return categories.find((c) => c.key === key) || null;
  }, [activeView, categories]);

  useEffect(() => {
    if (activeView !== "featured") return;
    runCollectionList({});
  }, [activeView, runCollectionList]);

  useEffect(() => {
    runClassifyLevel1({});
  }, [runClassifyLevel1]);

  useEffect(() => {
    if (activeView === "featured") return;
    runList({
      page,
      pageSize,
      search: query?.trim() || undefined,
      ...(activeCategory?.filter ?? {}),
    });
  }, [
    activeView,
    activeCategory?.key,
    page,
    pageSize,
    runList,
    activeCategory?.filter,
    query,
  ]);

  const viewOptions = useMemo(() => {
    const options: { label: string; value: string }[] = [
      { label: t("ui.featured"), value: "featured" },
      { label: t("ui.all"), value: "all" },
    ];
    for (const cat of categories) {
      options.push({ label: cat.label, value: `cat:${cat.key}` });
    }
    return options;
  }, [categories, t]);

  const handleViewChange = (value: string | number) => {
    const v = String(value);
    setActiveView(v);
    setPage(1);
  };

  const handleAddFromCard = (item: any) => {
    onAddStoreItem?.({ kind: "website", site: item });
  };

  const openCollection = (collectionId: string) => {
    navigate(storeRoute.path.website.collection(collectionId));
  };

  const openWebsiteDetail = (item: any) => {
    const id = getWebsiteId(item);
    navigate(storeRoute.path.website.detail(id), {
      state: { item },
    });
  };

  return (
    <DefaultAppView
      className="h-full"
      contentClassName="flex flex-col overflow-hidden px-0 pt-0 pb-0"
      headerClassName="items-center px-3 pt-3 pb-2"
      headerRight={
        <Button
          type="primary"
          onClick={() => setAddVisible(true)}
          icon={<RiAddLine size={16} />}
          shape="round"
          size="small"
        >
          {t("ui.custom")}
        </Button>
      }
    >
      <div className="shrink-0 px-4 pb-2 pt-3">
        <AppCategoryRail
          options={viewOptions}
          value={activeView}
          onChange={handleViewChange}
          ariaLabel={t("ui.categories")}
          previousLabel={t("ui.previousCategories")}
          nextLabel={t("ui.nextCategories")}
        />
      </div>
      {activeView === "featured" ? (
        <div className="min-h-0 flex-1">
          <FeaturedView
            featuredHomeScrollRef={featuredHomeScrollRef}
            collectionItems={collectionItems}
            collectionListLoading={collectionListLoading}
            onOpenCollection={openCollection}
            onAddFromCard={handleAddFromCard}
            onOpenWebsiteDetail={openWebsiteDetail}
          />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4">
            <div className="mb-4 px-1">
              <div className="text-[28px] font-bold leading-[34px] tracking-normal text-[var(--sn-text)]">
                {activeCategory?.label ?? t("ui.allWebsites")}
              </div>
              <div className="mt-1 text-[13px] leading-5 text-[var(--sn-text-secondary)]">
                {t("ui.storeItemCount", { count: listTotal })}
              </div>
            </div>

            {listLoading && listItems.length === 0 ? (
              <WebsiteGridSkeleton count={Math.min(8, pageSize)} />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {listItems.map((item) => (
                  <WebsiteCard
                    key={getWebsiteId(item)}
                    item={item}
                    layout="grid"
                    variant="normal"
                    onAdd={handleAddFromCard}
                    onClick={openWebsiteDetail}
                  />
                ))}
              </div>
            )}

            {!listLoading && listItems.length === 0 ? (
              <Empty className="mt-16" description={t("ui.noData")} />
            ) : null}
          </div>

          {listTotal > pageSize ? <div className="shrink-0 px-4 pb-4 pt-2">
            <Pagination
              size="small"
              current={page}
              pageSize={pageSize}
              total={listTotal}
              showSizeChanger
              pageSizeOptions={[10, 20, 40, 80]}
              onChange={(p, ps) => {
                setPage(p);
                if (ps !== pageSize) setPageSize(ps);
              }}
              disabled={listLoading}
              className="flex justify-end"
            />
          </div> : null}
        </div>
      )}

      <AddWebsiteModal
        open={addVisible}
        onClose={() => setAddVisible(false)}
        onAdd={(site) => onAddStoreItem?.({ kind: "website", site })}
      />
    </DefaultAppView>
  );
};

export default WebsiteView;
