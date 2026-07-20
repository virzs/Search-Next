import { css, cx } from "@emotion/css";
import { useState, type FC, type ReactNode } from "react";
import { RiApps2Line } from "@remixicon/react";
import { useI18n } from "@/i18n";

export interface StoreHeroArtworkItem {
  src?: string | null;
  label: string;
}

interface StoreHeroCardProps {
  title: string;
  description: string;
  eyebrow?: ReactNode;
  artwork?: ReactNode;
  tone?: "website" | "app" | "widget" | "dev";
  className?: string;
}

const ArtworkTile = ({ item }: { item: StoreHeroArtworkItem }) => {
  const [failed, setFailed] = useState(false);
  const fallback = item.label.trim().charAt(0).toUpperCase();

  return (
    <div className={artworkTileClassName} title={item.label}>
      {!failed && item.src ? (
        <img
          src={item.src}
          alt=""
          className="h-full w-full object-contain"
          onError={() => setFailed(true)}
        />
      ) : fallback ? (
        <span>{fallback}</span>
      ) : (
        <RiApps2Line size={22} />
      )}
    </div>
  );
};

export const StoreHeroArtwork = ({
  items,
}: {
  items: StoreHeroArtworkItem[];
}) => {
  const visibleItems = items.slice(0, 4);

  return (
    <div className={artworkGridClassName} aria-hidden="true">
      {visibleItems.map((item, index) => (
        <ArtworkTile key={`${item.label}-${index}`} item={item} />
      ))}
    </div>
  );
};

const StoreHeroCard: FC<StoreHeroCardProps> = ({
  title,
  description,
  eyebrow,
  artwork,
  tone = "website",
  className = "",
}) => {
  const { t } = useI18n();

  return (
    <section className={cx(heroBaseClassName, heroToneClassName[tone], className)}>
      <div className="relative z-[1] min-w-0">
        <div className="text-[11px] font-semibold leading-4 text-[var(--sn-accent)]">
          {eyebrow ?? t("ui.featuredToday")}
        </div>
        <h1 className="mt-2 text-[26px] font-bold leading-8 tracking-[-0.01em] text-[var(--sn-text)]">
          {title}
        </h1>
        <p className="mt-2 max-w-[500px] text-[13px] leading-5 text-[var(--sn-text-secondary)]">
          {description}
        </p>
      </div>
      {artwork ? <div className={heroArtworkClassName}>{artwork}</div> : null}
    </section>
  );
};

export default StoreHeroCard;

const heroBaseClassName = css`
  position: relative;
  display: grid;
  min-height: 138px;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 28px;
  overflow: hidden;
  border: 1px solid var(--sn-separator);
  border-radius: var(--sn-radius-panel);
  padding: 22px 24px;
  background: var(--sn-surface);
  box-shadow:
    var(--sn-shadow),
    inset 0 1px 0 color-mix(in srgb, white 55%, transparent);

  &::after {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at 88% 20%,
      color-mix(in srgb, var(--sn-accent) 10%, transparent),
      transparent 42%
    );
    content: "";
    pointer-events: none;
  }

  @media (max-width: 540px) {
    min-height: 0;
    grid-template-columns: 1fr;
    padding: 20px;
  }
`;

const heroArtworkClassName = css`
  position: relative;
  z-index: 1;
  min-width: 0;

  @media (max-width: 540px) {
    display: none;
  }
`;

const heroToneClassName = {
  website: css`
    background-image: linear-gradient(135deg, rgba(52, 199, 89, 0.055), transparent 58%);
  `,
  app: css`
    background-image: linear-gradient(135deg, rgba(10, 132, 255, 0.06), transparent 58%);
  `,
  widget: css`
    background-image: linear-gradient(135deg, rgba(175, 82, 222, 0.06), transparent 58%);
  `,
  dev: css`
    background-image: linear-gradient(135deg, rgba(255, 149, 0, 0.06), transparent 58%);
  `,
};

const artworkGridClassName = css`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 188px;

  > * + * {
    margin-left: -12px;
  }

  > *:nth-child(2) {
    transform: translateY(-8px);
  }

  > *:nth-child(3) {
    transform: translateY(7px);
  }
`;

const artworkTileClassName = css`
  display: grid;
  width: 62px;
  height: 62px;
  flex: 0 0 62px;
  place-items: center;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--sn-separator) 82%, white);
  border-radius: var(--sn-radius-surface);
  background: color-mix(in srgb, var(--sn-surface-strong) 92%, transparent);
  padding: 10px;
  color: var(--sn-text-tertiary);
  font-size: 18px;
  font-weight: 700;
  box-shadow:
    0 10px 24px rgba(0, 0, 0, 0.11),
    inset 0 1px 0 color-mix(in srgb, white 72%, transparent);
`;
