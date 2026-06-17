import { css, cx } from "@emotion/css";
import { FC } from "react";

interface StoreHeroCardProps {
  title: string;
  description: string;
  tone?: "website" | "widget" | "dev";
  className?: string;
}

const heroBaseClassName = css`
  position: relative;
  min-height: 164px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 22px;
  padding: 30px 34px;
  display: flex;
  align-items: center;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.82),
    0 10px 26px rgba(15, 23, 42, 0.06);

  &::before {
    content: "";
    position: absolute;
    inset: 1px;
    border-radius: 21px;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.42),
      rgba(255, 255, 255, 0) 45%
    );
    pointer-events: none;
  }

  &::after {
    content: "";
    position: absolute;
    top: 24px;
    right: 26px;
    width: 112px;
    height: 112px;
    border-radius: 34px;
    background: rgba(255, 255, 255, 0.24);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.44);
    transform: rotate(10deg);
    pointer-events: none;
  }
`;

const heroToneClassName = {
  website: css`
    background: linear-gradient(135deg, #ffffff 0%, #f3fbf7 54%, #fff7e8 100%);
  `,
  widget: css`
    background: linear-gradient(135deg, #ffffff 0%, #eef6ff 54%, #f7f2ff 100%);
  `,
  dev: css`
    background: linear-gradient(135deg, #ffffff 0%, #edf9f2 54%, #edf7ff 100%);
  `,
};

const StoreHeroCard: FC<StoreHeroCardProps> = ({
  title,
  description,
  tone = "website",
  className = "",
}) => {
  return (
    <div
      className={cx(heroBaseClassName, heroToneClassName[tone], className)}
    >
      <div className="relative z-[1] flex max-w-xl flex-col gap-4">
        <div className="text-[31px] font-extrabold leading-9 tracking-normal text-gray-950 dark:text-gray-50">
          {title}
        </div>
        <div className="max-w-[548px] text-[15px] font-medium leading-6 text-gray-600 dark:text-gray-300">
          {description}
        </div>
      </div>
    </div>
  );
};

export default StoreHeroCard;
