import { Empty, Skeleton } from "antd";
import type React from "react";
import StoreHeroCard, {
  StoreHeroArtwork,
} from "../../../components/StoreHeroCard";
import { getWebsiteIconUrl, getWebsiteId, getWebsiteName } from "../../../utils";
import WebsiteCard from "../../../components/WebsiteCard";
import { useI18n } from "@/i18n";
import { AppButton } from "@/components/ui";

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
    <div className="-mx-1 flex snap-x snap-mandatory flex-nowrap gap-3 overflow-x-auto overflow-y-hidden px-1 pb-2">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="w-[252px] shrink-0 snap-start max-[640px]:w-[calc(100vw-176px)]">
          <Skeleton.Image
            active
            style={{
              width: 252,
              height: 76,
              borderRadius: "var(--sn-radius-surface)",
            }}
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

const CollectionArtwork = ({ items }: { items: any[] }) => {
  const icons = items.map(getWebsiteIconUrl).filter(Boolean).slice(0, 6);
  return (
    <div className="grid h-24 w-24 shrink-0 grid-cols-2 gap-2 rounded-[var(--sn-radius-surface)] bg-white/15 p-2">
      {Array.from({ length: 4 }).map((_, idx) => {
        const icon = icons[idx];
        return (
          <div
            key={idx}
            className="flex items-center justify-center overflow-hidden rounded-[var(--sn-radius-compact)] bg-white/85"
          >
            {icon ? (
              <img src={icon} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-white/60" />
            )}
          </div>
        );
      })}
    </div>
  );
};

const FeaturedCollectionCard = ({
  collection,
  onOpen,
}: {
  collection: any;
  onOpen: (id: string) => void;
}) => {
  const items = collection.previewWebsites || collection.websites || [];
  const accent = collection.accentColor || "var(--sn-accent)";
  return (
    <button
      type="button"
      onClick={() => onOpen(collection._id)}
      className="group flex min-h-[168px] w-full cursor-pointer items-end justify-between gap-5 overflow-hidden rounded-[var(--sn-radius-panel)] border-0 p-5 text-left shadow-[var(--sn-shadow)] transition hover:-translate-y-px active:translate-y-0"
      style={{
        background: `linear-gradient(135deg, ${accent}, #0f172a)`,
      }}
    >
      <div className="min-w-0 text-white">
        <div className="mb-2 text-[11px] font-bold uppercase leading-4 text-white/72">
          {collection.kicker || "Featured"}
        </div>
        <div className="line-clamp-2 text-[24px] font-bold leading-[30px]">
          {collection.title}
        </div>
        {collection.description ? (
          <div className="mt-2 line-clamp-2 max-w-md text-sm font-semibold leading-5 text-white/74">
            {collection.description}
          </div>
        ) : null}
      </div>
      <CollectionArtwork items={items} />
    </button>
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
  const featuredCollections = collectionItems
    .filter((item: any) => item?.featured)
    .slice(0, 2);
  const normalCollections = collectionItems.filter(
    (item: any) => !featuredCollections.some((c: any) => c._id === item._id),
  );
  const heroWebsites = collectionItems
    .flatMap((item: any) => item.previewWebsites || item.websites || [])
    .slice(0, 4);
  return (
    <div
      ref={featuredHomeScrollRef}
      className="flex-1 overflow-y-auto px-4 pb-8"
    >
      <StoreHeroCard
        title={t("ui.curatedProductivityWebsites")}
        description={t("ui.store.websiteHeroDescription")}
        tone="website"
        artwork={
          <StoreHeroArtwork
            items={heroWebsites.map((item: any) => ({
              src: getWebsiteIconUrl(item),
              label: getWebsiteName(item),
            }))}
          />
        }
        className="mb-6"
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
                  <Skeleton.Button active size="small" />
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
              <div className="flex flex-col gap-6">
                {featuredCollections.length ? (
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {featuredCollections.map((c: any) => (
                      <FeaturedCollectionCard
                        key={c._id}
                        collection={c}
                        onOpen={onOpenCollection}
                      />
                    ))}
                  </div>
                ) : null}

                {normalCollections.map((c: any) => (
                  <div key={c._id}>
                    <div className="mb-3 flex items-end justify-between gap-3 px-1">
                      <div className="min-w-0">
                        {c.kicker ? (
                          <div className="mb-1 text-[11px] font-bold uppercase leading-4 text-[var(--sn-accent-text)]">
                            {c.kicker}
                          </div>
                        ) : null}
                        <div className="line-clamp-1 text-[17px] font-semibold leading-[22px] text-[var(--sn-text)]">
                          {c.title}
                        </div>
                        <div className="mt-1 line-clamp-1 text-[13px] font-medium leading-5 text-[var(--sn-text-secondary)]">
                          {c.description ||
                            t("ui.storeItemCount", { count: c.total ?? (c.websites || []).length })}
                        </div>
                      </div>
                      <AppButton
                        intent="link"
                        size="small"
                        onClick={() => onOpenCollection(c._id)}
                      >
                        {t("ui.viewMore")}
                      </AppButton>
                    </div>
                    <div className="-mx-1 flex snap-x snap-mandatory flex-nowrap gap-3 overflow-x-auto overflow-y-hidden px-1 pb-2">
                      {(c.previewWebsites || c.websites || []).map((item: any) => (
                        <div
                          key={getWebsiteId(item)}
                          className="w-[252px] shrink-0 snap-start max-[640px]:w-[calc(100vw-176px)]"
                        >
                          <WebsiteCard
                            item={item}
                            layout="grid"
                            variant="small"
                            onAdd={onAddFromCard}
                            onClick={onOpenWebsiteDetail}
                          />
                        </div>
                      ))}
                      {(c.previewWebsites || c.websites || []).length === 0 && (
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
