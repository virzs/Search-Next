import { Button, Empty, Skeleton } from "antd";
import type React from "react";
import StoreHeroCard from "../../../components/StoreHeroCard";
import { getWebsiteId } from "../../../utils";
import WebsiteCard from "../../../components/WebsiteCard";
import { useI18n } from "@/i18n";

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
          <Skeleton.Image
            active
            style={{ width: 224, height: 120, borderRadius: 16 }}
          />
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
  const { t } = useI18n();
  return (
    <div
      ref={featuredHomeScrollRef}
      className="flex-1 overflow-y-auto px-3 pb-6"
    >
      <StoreHeroCard
        title={t("ui.curatedProductivityWebsites")}
        description={t("ui.store.websiteHeroDescription")}
        tone="website"
        className="mb-5"
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
              <Empty className="mt-4" description={t("ui.noCollections")} />
            ) : (
              <div className="flex flex-col gap-5">
                {collectionItems.map((c: any) => (
                  <div key={c._id}>
                    <div className="mb-3 flex items-end justify-between gap-3 px-1">
                      <div className="min-w-0">
                        <div className="line-clamp-1 text-xl font-bold tracking-normal text-gray-950 dark:text-gray-50">
                          {c.title}
                        </div>
                        <div className="mt-1 line-clamp-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                          {c.description || " "}
                        </div>
                      </div>
                      <Button
                        type="link"
                        className="px-0! font-bold! text-[#0071e3]!"
                        onClick={() => onOpenCollection(c._id)}
                      >
                        {t("ui.viewMore")}
                      </Button>
                    </div>
                    <div className="-mx-1 flex flex-nowrap gap-3 overflow-x-auto overflow-y-hidden px-1 pb-2">
                      {(c.websites || []).map((item: any) => (
                        <div key={getWebsiteId(item)} className="w-64 shrink-0">
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
                        <Empty className="mt-2" description={t("ui.noWebsites")} />
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
