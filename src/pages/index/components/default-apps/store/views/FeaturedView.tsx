import { Button, Empty, Pagination, Skeleton } from "antd";
import type React from "react";
import StoreHeroCard from "../components/StoreHeroCard";
import WebsiteCard from "../components/WebsiteCard";
import { getWebsiteId } from "../utils";
import { AppContentContainer } from "@/components";

export type FeaturedRoute = { type: "home" } | { type: "collection"; id: string };

export interface FeaturedViewProps {
  featuredRoute: FeaturedRoute;
  featuredHomeScrollRef: React.MutableRefObject<HTMLDivElement | null>;
  collectionItems: any[];
  collectionListLoading: boolean;
  openCollection: (collectionId: string) => void;
  backToFeaturedHome: () => void;
  activeCollection: any | null;
  activeCollectionWebsites: any[];
  collectionWebsitesLoading: boolean;
  collectionPage: number;
  collectionPageSize: number;
  activeCollectionTotal: number;
  onChangeCollectionPage: (page: number, pageSize: number) => void;
  onAddFromCard: (item: any) => void;
  onClickWebsite: (item: any) => void;
}

const SkeletonWebsiteCardRow: React.FC<{ count: number }> = ({ count }) => {
  return (
    <div className="flex flex-nowrap gap-4 overflow-x-auto overflow-y-hidden pb-2 -mx-1 px-1">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="w-56 shrink-0">
          <Skeleton.Image active style={{ width: 224, height: 120, borderRadius: 16 }} />
          <div className="mt-2 px-1">
            <Skeleton
              active
              title={false}
              paragraph={{ rows: 2, width: ["80%", "60%"] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
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

const FeaturedView: React.FC<FeaturedViewProps> = ({
  featuredRoute,
  featuredHomeScrollRef,
  collectionItems,
  collectionListLoading,
  openCollection,
  backToFeaturedHome,
  activeCollection,
  activeCollectionWebsites,
  collectionWebsitesLoading,
  collectionPage,
  collectionPageSize,
  activeCollectionTotal,
  onChangeCollectionPage,
  onAddFromCard,
  onClickWebsite,
}) => {
  if (featuredRoute.type === "collection") {
    const titleNode = activeCollection?.title ? (
      <div className="text-lg font-bold  line-clamp-1">
        {activeCollection.title}
      </div>
    ) : (
      <Skeleton.Input active size="small" style={{ width: 180 }} />
    );

    return (
      <AppContentContainer
        className="h-full"
        animate
        onBack={backToFeaturedHome}
        title={titleNode}
      >
        <div className="p-6 pt-0">
          {collectionWebsitesLoading ? (
            <SkeletonWebsiteGrid count={Math.min(6, collectionPageSize)} />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeCollectionWebsites.map((item: any) => (
                  <WebsiteCard
                    key={getWebsiteId(item)}
                    item={item}
                    layout="grid"
                    variant="normal"
                    onAdd={onAddFromCard}
                    onClick={onClickWebsite}
                  />
                ))}
              </div>
              {activeCollectionWebsites.length === 0 && (
                <Empty className="mt-8" description="暂无数据" />
              )}
              <div className="flex items-center justify-end pt-4">
                <Pagination
                  size="small"
                  current={collectionPage}
                  pageSize={collectionPageSize}
                  total={activeCollectionTotal}
                  showSizeChanger
                  pageSizeOptions={[12, 24, 48, 96]}
                  onChange={onChangeCollectionPage}
                  disabled={collectionWebsitesLoading}
                />
              </div>
            </>
          )}
        </div>
      </AppContentContainer>
    );
  }

  return (
    <div
      ref={featuredHomeScrollRef}
      className="mt-5 flex-1 overflow-y-auto pr-2 pl-1 pb-4"
    >
      <StoreHeroCard
        subtitle="今日推荐"
        title="发现优质网站"
        description="探索我们为您精选的实用工具、高效办公和创意设计资源。"
        gradient="bg-linear-to-br from-blue-600 via-sky-500 to-indigo-500"
        circlePosition="right"
        className="mb-4"
      />

      <div className="mt-2">
        {collectionListLoading ? (
          <div className="flex flex-col gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx}>
                <div className="flex items-end justify-between gap-3 mb-3 px-1">
                  <Skeleton
                    active
                    title={{ width: 160 }}
                    paragraph={{ rows: 1, width: 260 }}
                  />
                  <Skeleton.Button active size="small" shape="round" />
                </div>
                <SkeletonWebsiteCardRow count={4} />
              </div>
            ))}
          </div>
        ) : (
          <>
            {collectionItems.length === 0 ? (
              <Empty className="mt-4" description="暂无合集" />
            ) : (
              <div className="flex flex-col gap-6">
                {collectionItems.map((c: any) => (
                  <div key={c._id}>
                    <div className="flex items-end justify-between gap-3 mb-3 px-1">
                      <div className="min-w-0">
                        <div className="text-lg font-bold  line-clamp-1">
                          {c.title}
                        </div>
                        <div className="text-sm  mt-0.5 line-clamp-1">
                          {c.description || " "}
                        </div>
                      </div>
                      <Button
                        type="link"
                        className="px-0! ! hover:text-(--store-primary)!"
                        onClick={() => openCollection(c._id)}
                      >
                        查看更多
                      </Button>
                    </div>
                    <div className="flex flex-nowrap gap-4 overflow-x-auto overflow-y-hidden pb-2 -mx-1 px-1">
                      {(c.websites || []).map((item: any) => (
                        <div key={getWebsiteId(item)} className="w-56 shrink-0">
                          <WebsiteCard
                            item={item}
                            layout="grid"
                            variant="small"
                            onAdd={onAddFromCard}
                            onClick={onClickWebsite}
                          />
                        </div>
                      ))}
                      {(c.websites || []).length === 0 && (
                        <Empty className="mt-2" description="暂无网站" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FeaturedView;
