import { useRequest } from "ahooks";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Empty, Form, Modal, Pagination, Input } from "antd";
import { getTabsWebsitePublic } from "@/services/website";
import { RiArrowLeftLine } from "@remixicon/react";
import { motion, AnimatePresence } from "framer-motion";
import { buildCategoriesFromItems, fallbackCategories, getWebsiteId } from "../utils";
import StoreHeroCard from "../components/StoreHeroCard";
import WebsiteCard from "../components/WebsiteCard";
import StoreSegmented from "../components/StoreSegmented";
import WebsiteDetailView from "./WebsiteDetailView";

interface WebsiteViewProps {
  onAddWebsite?: (site: any) => void;
  query?: string;
  active?: boolean;
}

const WebsiteView: React.FC<WebsiteViewProps> = ({ onAddWebsite, query, active = true }) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [addVisible, setAddVisible] = useState(false);
  const [detailItem, setDetailItem] = useState<any>(null);
  const [form] = Form.useForm();

  const [activeView, setActiveView] = useState<string>("featured");
  const [featuredRoute, setFeaturedRoute] = useState<{ type: "home" } | { type: "collection"; key: string }>({
    type: "home",
  });
  const featuredHomeScrollRef = useRef<HTMLDivElement | null>(null);
  const featuredHomeScrollTopRef = useRef(0);
  const featuredRequestedSizeRef = useRef(60);

  const { data: listData, loading: listLoading, run: runList } = useRequest(getTabsWebsitePublic, { manual: true });
  const {
    data: featuredData,
    loading: featuredLoading,
    run: runFeatured,
  } = useRequest(getTabsWebsitePublic, {
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

  const featuredItems = useMemo(() => (featuredData?.data as any[]) || [], [featuredData]);
  const listItems = useMemo(() => (listData?.data as any[]) || [], [listData]);
  const listTotal = useMemo(() => (listData as any)?.total ?? (listData as any)?.count ?? 0, [listData]);

  const categories = useMemo(() => {
    const dynamic = buildCategoriesFromItems(featuredItems.length ? featuredItems : listItems);
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
    runFeatured({ page: 1, pageSize: featuredRequestedSizeRef.current, search: query || undefined });
  }, [activeView, query, runFeatured]);

  useEffect(() => {
    if (activeView === "featured") return;
    runList({
      page,
      pageSize,
      search: query || undefined,
      ...(activeCategory?.filter ?? {}),
    });
  }, [activeView, activeCategory?.key, page, pageSize, query, runList, activeCategory?.filter]);

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

  const featuredSections = useMemo(() => {
    const list = featuredItems;
    const sections = [
      {
        key: "editors",
        title: "编辑精选",
        subtitle: "今天值得装进桌面的站点",
        items: list.slice(0, 10),
      },
      {
        key: "trending",
        title: "本周热门",
        subtitle: "大家都在用的精选集合",
        items: list.slice(10, 22),
      },
      {
        key: "new",
        title: "新上架",
        subtitle: "最近收录的站点",
        items: list.slice(22, 34),
      },
    ].filter((s) => s.items.length > 0);
    return sections;
  }, [featuredItems]);

  const featuredCollections = useMemo(() => {
    return {
      editors: { title: "编辑精选", subtitle: "今天值得装进桌面的站点", start: 0, end: 80 },
      trending: { title: "本周热门", subtitle: "大家都在用的精选集合", start: 80, end: 160 },
      new: { title: "新上架", subtitle: "最近收录的站点", start: 160, end: 240 },
    };
  }, []);

  const activeCollection = useMemo(() => {
    if (featuredRoute.type !== "collection") return null;
    const meta = (featuredCollections as any)[featuredRoute.key] as
      | { title: string; subtitle: string; start: number; end: number }
      | undefined;
    if (!meta) return null;
    return { key: featuredRoute.key, ...meta };
  }, [featuredCollections, featuredRoute]);

  const openCollection = async (collectionKey: string) => {
    featuredHomeScrollTopRef.current = featuredHomeScrollRef.current?.scrollTop ?? 0;

    const meta = (featuredCollections as any)[collectionKey] as { start: number; end: number } | undefined;
    const needSize = meta?.end ?? 120;
    if (featuredRequestedSizeRef.current < needSize) {
      featuredRequestedSizeRef.current = needSize;
      runFeatured({ page: 1, pageSize: needSize, search: query || undefined });
    }

    setFeaturedRoute({ type: "collection", key: collectionKey });
  };

  const backToFeaturedHome = () => {
    setFeaturedRoute({ type: "home" });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        featuredHomeScrollRef.current?.scrollTo({ top: featuredHomeScrollTopRef.current });
      });
    });
  };

  return (
    <div className="h-full relative overflow-hidden">
      {/* Main Content */}
      <div
        className={`h-full flex flex-col overflow-hidden transition-opacity duration-300 ${detailItem ? "opacity-0 pointer-events-none absolute inset-0" : "opacity-100"
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
          >
            自定义
          </Button>
        </div>

        {activeView === "featured" ? (
          featuredRoute.type === "collection" && activeCollection ? (
            <div className="mt-5 flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between gap-3 shrink-0 px-1">
                <div className="flex items-center gap-2 min-w-0">
                  <Button
                    type="text"
                    className="rounded-full! ! "
                    icon={<RiArrowLeftLine size={18} />}
                    onClick={backToFeaturedHome}
                  >
                    返回
                  </Button>
                  <div className="min-w-0">
                    <div className="text-lg font-bold  line-clamp-1">
                      {activeCollection.title}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex-1 overflow-y-auto pr-2 pl-1 pb-4">
                {featuredLoading ? (
                  <div className="mt-2 text-sm ">Loading...</div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {featuredItems.slice(activeCollection.start, activeCollection.end).map((item: any) => (
                        <WebsiteCard
                          key={getWebsiteId(item)}
                          item={item}
                          layout="grid"
                          variant="normal"
                          onAdd={handleAddFromCard}
                          onClick={setDetailItem}
                        />
                      ))}
                    </div>
                    {featuredItems.length === 0 && <Empty className="mt-8" description="暂无数据" />}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div ref={featuredHomeScrollRef} className="mt-5 flex-1 overflow-y-auto pr-2 pl-1 pb-4">
              <StoreHeroCard
                subtitle="今日推荐"
                title="发现优质网站"
                description="探索我们为您精选的实用工具、高效办公和创意设计资源。"
                gradient="bg-linear-to-br from-blue-600 via-sky-500 to-indigo-500"
                circlePosition="right"
                className="mb-4"
              />

              {/* Category Browsing removed from featured view as requested, but keeping category tags section below */}

              {featuredLoading ? (
                <div className="mt-6 text-sm ">Loading...</div>
              ) : (
                <>
                  {featuredSections.map((section) => (
                    <div key={section.key} className="mt-2">
                      <div className="flex items-end justify-between gap-3 mb-4 px-1">
                        <div>
                          <div className="text-lg font-bold ">{section.title}</div>
                          <div className="text-sm  mt-0.5">{section.subtitle}</div>
                        </div>
                        <Button
                          type="link"
                          className="px-0! ! hover:text-(--store-primary)!"
                          onClick={() => openCollection(section.key)}
                        >
                          查看更多
                        </Button>
                      </div>

                      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                        {section.items.map((item: any) => (
                          <div key={getWebsiteId(item)} className="w-56 shrink-0">
                            <WebsiteCard
                              item={item}
                              layout="grid"
                              variant="small"
                              onAdd={handleAddFromCard}
                              onClick={setDetailItem}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {featuredItems.length === 0 && <Empty className="mt-8" description="暂无推荐数据" />}
                </>
              )}
            </div>
          )
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
              {!listLoading && listItems.length === 0 && <Empty description="暂无数据" />}
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
            <WebsiteDetailView item={detailItem} onBack={() => setDetailItem(null)} onAdd={handleAddFromCard} />
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
          <Form.Item name="url" label="网址" rules={[{ required: true, type: "url" }]}>
            <Input placeholder="例如：https://example.com" className="rounded-lg!" />
          </Form.Item>
          <Form.Item name="iconUrl" label="图标URL" rules={[{ type: "url" }]}>
            <Input placeholder="例如：https://example.com/icon.png" className="rounded-lg!" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WebsiteView;
