import { useRequest } from "ahooks";
import { Empty, Pagination, Skeleton } from "antd";
import { FC, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  getTabsWebsiteCollectionPublicList,
  getTabsWebsiteCollectionPublicWebsitesPage,
} from "@/services/website";
import { DefaultAppView, useAppRouteContext } from "@/components";
import WebsiteCard from "../../../components/WebsiteCard";
import { getWebsiteId } from "../../../utils";
import { storeRoute } from "../../../route-paths";

type StoreOutletContext = {
  onAddWebsite?: (site: any) => void;
};

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

const WebsiteCollectionRoute: FC = () => {
  const { id } = useParams();
  const collectionId = id ? decodeURIComponent(id) : "";
  const navigate = useNavigate();
  const { onAddWebsite } = useAppRouteContext<StoreOutletContext>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);

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
    setPage(1);
  }, [collectionId]);

  useEffect(() => {
    runCollectionWebsites(collectionId, { page, pageSize });
  }, [collectionId, page, pageSize, runCollectionWebsites]);

  const collectionItems = useMemo(
    () => (collectionListData as any[]) || [],
    [collectionListData],
  );
  const activeCollection = useMemo(
    () => collectionItems.find((c: any) => c?._id === collectionId) || null,
    [collectionItems, collectionId],
  );

  const activeCollectionWebsites = useMemo(
    () => ((collectionWebsitesData as any)?.data as any[]) || [],
    [collectionWebsitesData],
  );
  const activeCollectionTotal = useMemo(
    () => (collectionWebsitesData as any)?.total ?? 0,
    [collectionWebsitesData],
  );

  const titleNode = activeCollection?.title ? (
    <div className="line-clamp-1 text-[30px] font-extrabold leading-9 tracking-normal text-gray-950 dark:text-gray-50">
      {activeCollection.title}
    </div>
  ) : (
    <Skeleton.Input active size="large" style={{ width: 180 }} />
  );

  const handleAddFromCard = (item: any) => {
    onAddWebsite?.(item);
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
      contentClassName="px-3 pb-6 pt-4"
    >
      <div>
        <div className="mb-4 px-1">
          {titleNode}
          {activeCollection?.description ? (
            <div className="mt-1 line-clamp-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
              {activeCollection.description}
            </div>
          ) : null}
        </div>

        {collectionWebsitesLoading ? (
          <SkeletonWebsiteGrid count={Math.min(6, pageSize)} />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {activeCollectionWebsites.map((item: any) => (
                <WebsiteCard
                  key={getWebsiteId(item)}
                  item={item}
                  layout="grid"
                  variant="normal"
                  onAdd={handleAddFromCard}
                  onClick={handleOpenWebsiteDetail}
                />
              ))}
            </div>
            {activeCollectionWebsites.length === 0 && (
              <Empty className="mt-8" description="暂无数据" />
            )}
            <div className="flex items-center justify-end pt-4">
              <Pagination
                size="small"
                current={page}
                pageSize={pageSize}
                total={activeCollectionTotal}
                showSizeChanger
                pageSizeOptions={[12, 24, 48, 96]}
                onChange={(p, ps) => {
                  setPage(p);
                  if (ps !== pageSize) setPageSize(ps);
                }}
                disabled={collectionWebsitesLoading}
              />
            </div>
          </>
        )}
      </div>
    </DefaultAppView>
  );
};

export default WebsiteCollectionRoute;
