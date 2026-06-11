import { FC } from "react";

interface StoreHeroCardProps {
  subtitle: string;
  title: string;
  description: string;
  gradient: string;
  circlePosition?: "left" | "right";
  className?: string;
}

const StoreHeroCard: FC<StoreHeroCardProps> = ({
  subtitle,
  title,
  description,
  gradient,
  circlePosition,
  className = "",
}) => {
  void circlePosition;

  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-white/60 ${gradient} px-7 py-7 text-white shadow-[0_18px_45px_rgba(15,23,42,0.16)] ${className}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.24),rgba(255,255,255,0)_44%)]" />
      <div className="relative z-10 max-w-2xl">
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/[0.78]">{subtitle}</div>
        <div className="mb-2 text-[34px] font-bold leading-tight tracking-normal">{title}</div>
        <div className="max-w-xl text-base leading-6 text-white/[0.88]">{description}</div>
      </div>
    </div>
  );
};

export default StoreHeroCard;
