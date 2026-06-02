import { Card } from "antd";
import { cx } from "@emotion/css";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";

export interface PreviewCardProps {
  title: ReactNode;
  description?: ReactNode;
  descriptionFallback?: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  cover?: ReactNode;
  className?: string;
  style?: CSSProperties;
  coverPadding?: CSSProperties["padding"];
  bodyPadding?: CSSProperties["padding"];
}

const PreviewCard = ({
  title,
  description,
  descriptionFallback = "暂无描述",
  active = false,
  disabled = false,
  onClick,
  cover,
  className,
  style,
  coverPadding = "0",
  bodyPadding = "12px",
}: PreviewCardProps) => {
  const activeRingColor = "rgba(22, 119, 255, 0.45)";
  const ringColor = active ? activeRingColor : "transparent";
  const clickable = Boolean(onClick) && !disabled;

  const metaDescription = (() => {
    if (description == null || description === "") {
      if (descriptionFallback == null || descriptionFallback === "")
        return null;
      if (typeof descriptionFallback === "string") {
        return (
          <div className="text-xs opacity-50 mt-1">{descriptionFallback}</div>
        );
      }
      return descriptionFallback;
    }
    if (typeof description === "string") {
      return (
        <div className="text-xs opacity-70 mt-1 line-clamp-2">
          {description}
        </div>
      );
    }
    return description;
  })();

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!clickable || !onClick) return;
    if (e.key === "Enter" || e.key === " ") onClick();
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      className={cx(
        "rounded-2xl transition select-none overflow-hidden",
        clickable ? "cursor-pointer hover:opacity-95 active:opacity-90" : null,
        className,
      )}
      style={{
        background: "rgba(255,255,255,0.18)",
        borderColor: "rgba(0,0,0,0.08)",
        color: "rgba(0,0,0,0.88)",
        boxShadow: `0 0 0 2px ${ringColor}`,
        cursor: disabled ? "not-allowed" : undefined,
        opacity: disabled ? 0.55 : undefined,
        ...style,
      }}
      styles={{
        cover: { padding: coverPadding },
        body: { padding: bodyPadding },
      }}
      cover={cover}
      onClick={() => (clickable && onClick ? onClick() : null)}
      onKeyDown={handleKeyDown}
    >
      <Card.Meta
        title={<div className="font-semibold truncate">{title}</div>}
        description={metaDescription}
      />
    </Card>
  );
};

export default PreviewCard;
