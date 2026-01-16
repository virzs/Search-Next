import { useRequest } from "ahooks";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Empty, Pagination } from "antd";
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
import { AppSegmented, DefaultAppView, useAppRouteContext } from "@/components";
import type { StoreOutletContext } from "../../index";
import AddWebsiteModal from "./add-website-modal";
import { storeRoute } from "../../route-paths";

const WebsiteView: React.FC = () => {
  const { onAddWebsite } = useAppRouteContext<StoreOutletContext>();
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
      ...(activeCategory?.filter ?? {}),
    });
  }, [
    activeView,
    activeCategory?.key,
    page,
    pageSize,
    runList,
    activeCategory?.filter,
  ]);

  const viewOptions = useMemo(() => {
    const options: { label: string; value: string }[] = [
      { label: "推荐", value: "featured" },
      { label: "全部", value: "all" },
    ];
    for (const cat of categories) {
      options.push({ label: cat.label, value: `cat:${cat.key}` });
    }
    return options;
  }, [categories]);

  const handleViewChange = (value: string | number) => {
    const v = String(value);
    setActiveView(v);
    setPage(1);
  };

  const handleAddFromCard = (item: any) => {
    onAddWebsite?.(item);
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
      contentClassName="flex flex-col overflow-hidden"
      headerLeft={
        <AppSegmented
          options={viewOptions}
          value={activeView}
          onChange={handleViewChange}
          className="max-w-full overflow-auto"
        />
      }
      headerRight={
        <Button
          type="primary"
          onClick={() => setAddVisible(true)}
          icon={<RiAddLine size={16} />}
          shape="round"
        >
          自定义
        </Button>
      }
    >
      {activeView === "featured" ? (
        <FeaturedView
          featuredHomeScrollRef={featuredHomeScrollRef}
          collectionItems={collectionItems}
          collectionListLoading={collectionListLoading}
          onOpenCollection={openCollection}
          onAddFromCard={handleAddFromCard}
          onOpenWebsiteDetail={openWebsiteDetail}
        />
      ) : (
        <>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 overflow-y-auto pr-2 pl-1 pb-4 flex-1">
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
            {!listLoading && listItems.length === 0 && (
              <Empty description="暂无数据" />
            )}
          </div>

          <div className="flex items-center justify-end pt-4 shrink-0">
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
            />
          </div>
        </>
      )}

      <AddWebsiteModal
        open={addVisible}
        onClose={() => setAddVisible(false)}
        onAddWebsite={onAddWebsite}
      />
    </DefaultAppView>
  );
};

export default WebsiteView;
