import { Button, Empty, Skeleton } from "antd";
import type React from "react";
import StoreHeroCard from "../components/StoreHeroCard";
import WebsiteCard from "../components/WebsiteCard";
import { getWebsiteId } from "../utils";

export interface FeaturedViewProps {
  featuredHomeScrollRef: React.MutableRefObject<HTMLDivElement | null>;
  collectionItems: any[];
  collectionListLoading: boolean;
  onOpenCollection: (collectionId: string) => void;
  onAddFromCard: (item: any) => void;
  onOpenWebsiteDetail: (item: any) => void;
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

const FeaturedView: React.FC<FeaturedViewProps> = ({
  featuredHomeScrollRef,
  collectionItems,
  collectionListLoading,
  onOpenCollection,
  onAddFromCard,
  onOpenWebsiteDetail,
}) => {
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
                        className="px-0! ! hover:text-[rgb(250,84,28)]!"
                        onClick={() => onOpenCollection(c._id)}
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
                            onClick={onOpenWebsiteDetail}
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
