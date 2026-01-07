import { useRequest } from "ahooks";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Empty, Form, Modal, Pagination, Input } from "antd";
import {
  getTabsWebsiteCollectionPublicList,
  getTabsWebsiteCollectionPublicWebsitesPage,
  getTabsWebsitePublic,
} from "@/services/website";
import { RiAddLine } from "@remixicon/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  buildCategoriesFromItems,
  fallbackCategories,
  getWebsiteId,
} from "../utils";
import WebsiteCard from "../components/WebsiteCard";
import StoreSegmented from "../components/StoreSegmented";
import WebsiteDetailView from "./WebsiteDetailView";
import FeaturedView, { FeaturedRoute } from "./FeaturedView";

interface WebsiteViewProps {
  onAddWebsite?: (site: any) => void;
  query?: string;
  active?: boolean;
}

const WebsiteView: React.FC<WebsiteViewProps> = ({
  onAddWebsite,
  query,
  active = true,
}) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [addVisible, setAddVisible] = useState(false);
  const [detailItem, setDetailItem] = useState<any>(null);
  const [form] = Form.useForm();

  const [activeView, setActiveView] = useState<string>("featured");
  const [featuredRoute, setFeaturedRoute] = useState<FeaturedRoute>({
    type: "home",
  });
  const featuredHomeScrollRef = useRef<HTMLDivElement | null>(null);
  const featuredHomeScrollTopRef = useRef(0);
  const featuredRequestedSizeRef = useRef(60);
  const [collectionPage, setCollectionPage] = useState(1);
  const [collectionPageSize, setCollectionPageSize] = useState(24);

  const {
    data: listData,
    loading: listLoading,
    run: runList,
  } = useRequest(getTabsWebsitePublic, { manual: true });
  const {
    data: featuredData,
    run: runFeatured,
  } = useRequest(getTabsWebsitePublic, {
    manual: true,
  });
  const {
    data: collectionListData,
    loading: collectionListLoading,
    run: runCollectionList,
  } = useRequest(getTabsWebsiteCollectionPublicList, { manual: true });
  const {
    data: collectionWebsitesData,
    loading: collectionWebsitesLoading,
    run: runCollectionWebsites,
  } = useRequest(getTabsWebsiteCollectionPublicWebsitesPage as any, {
    manual: true,
  });

  const prevQueryRef = useRef(query);

  useEffect(() => {
    const isQueryChanged = prevQueryRef.current !== query;
    if (isQueryChanged) {
      prevQueryRef.current = query;
      setPage(1);
      featuredRequestedSizeRef.current = 60;
      setFeaturedRoute({ type: "home" });
    }
  }, [query]);

  useEffect(() => {
    if (active) return;
    setDetailItem(null);
  }, [active]);

  const featuredItems = useMemo(
    () => (featuredData?.data as any[]) || [],
    [featuredData],
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

  const categories = useMemo(() => {
    const dynamic = buildCategoriesFromItems(
      featuredItems.length ? featuredItems : listItems,
    );
    const merged = [...dynamic];
    const existed = new Set(merged.map((c) => c.key));
    for (const c of fallbackCategories) {
      if (!existed.has(c.key)) merged.push(c);
    }
    return merged.slice(0, 10);
  }, [featuredItems, listItems]);

  const activeCategory = useMemo(() => {
    if (!activeView.startsWith("cat:")) return null;
    const key = activeView.slice("cat:".length);
    return categories.find((c) => c.key === key) || null;
  }, [activeView, categories]);

  useEffect(() => {
    if (activeView !== "featured") return;
    runFeatured({
      page: 1,
      pageSize: featuredRequestedSizeRef.current,
      search: query || undefined,
    });
  }, [activeView, query, runFeatured]);

  useEffect(() => {
    if (activeView !== "featured") return;
    runCollectionList({});
  }, [activeView, runCollectionList]);

  useEffect(() => {
    if (activeView === "featured") return;
    runList({
      page,
      pageSize,
      search: query || undefined,
      ...(activeCategory?.filter ?? {}),
    });
  }, [
    activeView,
    activeCategory?.key,
    page,
    pageSize,
    query,
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
    setDetailItem(null);
    if (v !== "featured") setFeaturedRoute({ type: "home" });
  };

  const handleAddFromCard = (item: any) => {
    onAddWebsite?.(item);
  };

  const activeCollection = useMemo(() => {
    if (featuredRoute.type !== "collection") return null;
    return (
      collectionItems.find((c: any) => c?._id === featuredRoute.id) || null
    );
  }, [collectionItems, featuredRoute]);

  const activeCollectionWebsites = useMemo(
    () => ((collectionWebsitesData as any)?.data as any[]) || [],
    [collectionWebsitesData],
  );
  const activeCollectionTotal = useMemo(
    () => (collectionWebsitesData as any)?.total ?? 0,
    [collectionWebsitesData],
  );

  const openCollection = async (collectionId: string) => {
    featuredHomeScrollTopRef.current =
      featuredHomeScrollRef.current?.scrollTop ?? 0;
    setCollectionPage(1);
    await runCollectionWebsites(collectionId, {
      page: 1,
      pageSize: collectionPageSize,
    });
    setFeaturedRoute({ type: "collection", id: collectionId });
  };

  const backToFeaturedHome = () => {
    setFeaturedRoute({ type: "home" });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        featuredHomeScrollRef.current?.scrollTo({
          top: featuredHomeScrollTopRef.current,
        });
      });
    });
  };

  const handleChangeCollectionPage = async (p: number, ps: number) => {
    setCollectionPage(p);
    if (ps !== collectionPageSize) setCollectionPageSize(ps);
    if (featuredRoute.type !== "collection") return;
    await runCollectionWebsites(featuredRoute.id, { page: p, pageSize: ps });
  };

  const showFeaturedCollectionOverlay =
    activeView === "featured" && featuredRoute.type === "collection";

  return (
    <div className="h-full relative overflow-hidden">
      {/* Main Content */}
      <div
        className={`h-full flex flex-col overflow-hidden transition-opacity duration-300 ${
          detailItem || showFeaturedCollectionOverlay
            ? "opacity-0 pointer-events-none absolute inset-0"
            : "opacity-100"
        }`}
      >
        <div className="shrink-0 flex items-center justify-between gap-3 px-1">
          <StoreSegmented
            options={viewOptions}
            value={activeView}
            onChange={handleViewChange}
            className="max-w-full overflow-auto"
          />
          <Button
            type="primary"
            onClick={() => setAddVisible(true)}
            icon={<RiAddLine size={16} />}
          >
            自定义
          </Button>
        </div>

        {activeView === "featured" ? (
          <FeaturedView
            featuredRoute={
              showFeaturedCollectionOverlay ? { type: "home" } : featuredRoute
            }
            featuredHomeScrollRef={featuredHomeScrollRef}
            collectionItems={collectionItems}
            collectionListLoading={collectionListLoading}
            openCollection={openCollection}
            backToFeaturedHome={backToFeaturedHome}
            activeCollection={activeCollection}
            activeCollectionWebsites={activeCollectionWebsites}
            collectionWebsitesLoading={collectionWebsitesLoading}
            collectionPage={collectionPage}
            collectionPageSize={collectionPageSize}
            activeCollectionTotal={activeCollectionTotal}
            onChangeCollectionPage={handleChangeCollectionPage}
            onAddFromCard={handleAddFromCard}
            onClickWebsite={setDetailItem}
          />
        ) : (
          <>
            <div className="mt-5 flex items-center justify-between shrink-0 px-1">
              <div className="text-lg font-bold ">
                {activeCategory ? activeCategory.label : "全部网站"}
              </div>
            </div>

            <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 overflow-y-auto pr-2 pl-1 pb-4 flex-1">
              {listItems.map((item) => (
                <WebsiteCard
                  key={getWebsiteId(item)}
                  item={item}
                  layout="grid"
                  variant="normal"
                  onAdd={handleAddFromCard}
                  onClick={setDetailItem}
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
      </div>

      <AnimatePresence>
        {showFeaturedCollectionOverlay && (
          <motion.div
            className="absolute inset-0 z-10 bg-(--store-bg-content)"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <FeaturedView
              featuredRoute={featuredRoute}
              featuredHomeScrollRef={featuredHomeScrollRef}
              collectionItems={collectionItems}
              collectionListLoading={collectionListLoading}
              openCollection={openCollection}
              backToFeaturedHome={backToFeaturedHome}
              activeCollection={activeCollection}
              activeCollectionWebsites={activeCollectionWebsites}
              collectionWebsitesLoading={collectionWebsitesLoading}
              collectionPage={collectionPage}
              collectionPageSize={collectionPageSize}
              activeCollectionTotal={activeCollectionTotal}
              onChangeCollectionPage={handleChangeCollectionPage}
              onAddFromCard={handleAddFromCard}
              onClickWebsite={setDetailItem}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail View Overlay */}
      <AnimatePresence>
        {detailItem && (
          <motion.div
            className="absolute inset-0 z-20 bg-(--store-bg-content)"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <WebsiteDetailView
              item={detailItem}
              onBack={() => setDetailItem(null)}
              onAdd={handleAddFromCard}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        zIndex={2001}
        open={addVisible}
        title="新增网站"
        onCancel={() => setAddVisible(false)}
        onOk={() => form.submit()}
        okText="添加"
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            const site = {
              name: values.name,
              url: values.url,
              icon: values.iconUrl ? { url: values.iconUrl } : undefined,
            };
            onAddWebsite?.(site);
            setAddVisible(false);
            form.resetFields();
          }}
        >
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input placeholder="例如：我的常用站点" className="rounded-lg!" />
          </Form.Item>
          <Form.Item
            name="url"
            label="网址"
            rules={[{ required: true, type: "url" }]}
          >
            <Input
              placeholder="例如：https://example.com"
              className="rounded-lg!"
            />
          </Form.Item>
          <Form.Item name="iconUrl" label="图标URL" rules={[{ type: "url" }]}>
            <Input
              placeholder="例如：https://example.com/icon.png"
              className="rounded-lg!"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WebsiteView;
