import { css, cx } from "@emotion/css";
import { FC } from "react";
import { useI18n } from "@/i18n";

interface StoreHeroCardProps {
  title: string;
  description: string;
  tone?: "website" | "app" | "widget" | "dev";
  className?: string;
}

const heroBaseClassName = css`
  position: relative;
  min-height: 176px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 26px;
  padding: 30px 36px;
  display: flex;
  align-items: center;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    0 1px 2px rgba(0, 0, 0, 0.035),
    0 22px 54px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(20px) saturate(1.08);

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.66),
      rgba(255, 255, 255, 0.08) 52%
    );
    pointer-events: none;
  }

  &::after {
    content: "";
    position: absolute;
    right: 34px;
    bottom: 26px;
    width: 226px;
    height: 92px;
    border-radius: 24px;
    background:
      linear-gradient(90deg, rgba(255, 255, 255, 0.86), rgba(255, 255, 255, 0.44)),
      radial-gradient(circle at 24px 50%, #007aff 0 10px, transparent 11px),
      radial-gradient(circle at 72px 50%, #34c759 0 10px, transparent 11px),
      radial-gradient(circle at 120px 50%, #ff9500 0 10px, transparent 11px),
      radial-gradient(circle at 168px 50%, #af52de 0 10px, transparent 11px);
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.72),
      0 18px 38px rgba(0, 0, 0, 0.08);
    pointer-events: none;
  }
`;

const heroToneClassName = {
  website: css`
    background: linear-gradient(135deg, #ffffff 0%, #f5f9ff 58%, #f2f2f7 100%);
  `,
  app: css`
    background: linear-gradient(135deg, #ffffff 0%, #f5f9ff 58%, #f4f2ff 100%);
  `,
  widget: css`
    background: linear-gradient(135deg, #ffffff 0%, #f5f9ff 58%, #f4f2ff 100%);
  `,
  dev: css`
    background: linear-gradient(135deg, #ffffff 0%, #f4fbf6 58%, #f2f7ff 100%);
  `,
};

const StoreHeroCard: FC<StoreHeroCardProps> = ({
  title,
  description,
  tone = "website",
  className = "",
}) => {
  const { t } = useI18n();
  return (
    <div
      className={cx(heroBaseClassName, heroToneClassName[tone], className)}
    >
      <div className="relative z-[1] flex max-w-xl flex-col gap-3">
        <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#007aff]">
          {t("ui.featuredToday")}
        </div>
        <div className="text-[33px] font-bold leading-10 tracking-normal text-[#1d1d1f]">
          {title}
        </div>
        <div className="max-w-[548px] text-[15px] font-medium leading-6 text-[#6e6e73]">
          {description}
        </div>
      </div>
    </div>
  );
};

export default StoreHeroCard;
