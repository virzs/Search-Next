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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="rounded-2xl overflow-hidden">
          <Skeleton.Image active style={{ width: "100%", height: 140 }} />
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
    <div className="text-lg font-bold  line-clamp-1">
      {activeCollection.title}
    </div>
  ) : (
    <Skeleton.Input active size="small" style={{ width: 180 }} />
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
      headerLeft={titleNode}
    >
      <div className="p-6 pt-0">
        {collectionWebsitesLoading ? (
          <SkeletonWebsiteGrid count={Math.min(6, pageSize)} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
