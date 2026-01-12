import { useRequest } from "ahooks";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Empty, Form, Modal, Pagination, Input } from "antd";
import {
  getTabsWebsiteCollectionPublicList,
  getTabsWebsitePublic,
} from "@/services/website";
import { RiAddLine } from "@remixicon/react";
import { useNavigate } from "react-router";
import {
  buildCategoriesFromItems,
  fallbackCategories,
  getWebsiteId,
} from "../../utils";
import WebsiteCard from "../../components/WebsiteCard";
import StoreSegmented from "../../components/StoreSegmented";
import FeaturedView from "../website/featured";
import { useAppRouteContext } from "@/components";
import type { StoreOutletContext } from "../../index";

const WebsiteView: React.FC = () => {
  const { onAddWebsite } = useAppRouteContext<StoreOutletContext>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [addVisible, setAddVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState<string>("featured");
  const featuredHomeScrollRef = useRef<HTMLDivElement | null>(null);
  const featuredRequestedSizeRef = useRef(60);

  const {
    data: listData,
    loading: listLoading,
    run: runList,
  } = useRequest(getTabsWebsitePublic, { manual: true });
  const { data: featuredData, run: runFeatured } = useRequest(
    getTabsWebsitePublic,
    {
      manual: true,
    },
  );
  const {
    data: collectionListData,
    loading: collectionListLoading,
    run: runCollectionList,
  } = useRequest(getTabsWebsiteCollectionPublicList, { manual: true });

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
    });
  }, [activeView, runFeatured]);

  useEffect(() => {
    if (activeView !== "featured") return;
    runCollectionList({});
  }, [activeView, runCollectionList]);

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
    navigate(`/store/website/collection/${encodeURIComponent(collectionId)}`);
  };

  const openWebsiteDetail = (item: any) => {
    const id = getWebsiteId(item);
    navigate(`/store/website/detail/${encodeURIComponent(id)}`, {
      state: { item },
    });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
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
          featuredHomeScrollRef={featuredHomeScrollRef}
          collectionItems={collectionItems}
          collectionListLoading={collectionListLoading}
          onOpenCollection={openCollection}
          onAddFromCard={handleAddFromCard}
          onOpenWebsiteDetail={openWebsiteDetail}
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
