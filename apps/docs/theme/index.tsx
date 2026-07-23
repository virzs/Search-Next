import {
  RiCloudLine,
  RiLayoutGridLine,
  RiPaletteLine,
  RiRocket2Line,
  RiSearch2Line,
  RiShieldUserLine,
  type RemixiconComponentType,
} from '@remixicon/react';

export * from 'rspress/theme';
export { default } from 'rspress/theme';

type HomeFeatureItem = {
  details?: string;
  icon?: string;
  title: string;
};

type HomeFeatureProps = {
  frontmatter?: {
    features?: HomeFeatureItem[];
  };
};

const icons: Record<string, RemixiconComponentType> = {
  cloud: RiCloudLine,
  desktop: RiLayoutGridLine,
  palette: RiPaletteLine,
  rocket: RiRocket2Line,
  search: RiSearch2Line,
  shield: RiShieldUserLine,
};

export function HomeFeature({ frontmatter }: HomeFeatureProps) {
  const features = frontmatter?.features ?? [];

  return (
    <section aria-label="产品能力" className="search-next-feature-grid">
      {features.map((feature) => {
        const Icon = icons[feature.icon ?? ''];

        return (
          <article className="search-next-feature-card" data-feature={feature.icon} key={feature.title}>
            <div className="search-next-feature-heading">
              {Icon ? (
                <div aria-hidden="true" className="search-next-feature-icon">
                  <Icon />
                </div>
              ) : null}
              <h2 className="search-next-feature-title">{feature.title}</h2>
            </div>
            {feature.details ? <p className="search-next-feature-detail">{feature.details}</p> : null}
          </article>
        );
      })}
    </section>
  );
}
