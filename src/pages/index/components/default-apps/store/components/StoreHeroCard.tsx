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
  circlePosition = "left",
  className = "",
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-(--store-border) ${gradient} px-6 py-6 text-white shadow-sm ${className}`}
    >
      {circlePosition === "left" && (
        <div className="absolute -left-14 -top-14 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
      )}
      {circlePosition === "right" && (
        <div className="absolute -right-14 -top-14 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
      )}

      <div className="relative z-10">
        <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-2">{subtitle}</div>
        <div className="text-3xl font-bold tracking-tight mb-2">{title}</div>
        <div className="text-base opacity-90 max-w-md">{description}</div>
      </div>
    </div>
  );
};

export default StoreHeroCard;
