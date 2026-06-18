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
  status?: ReactNode;
  action?: ReactNode;
  className?: string;
  style?: CSSProperties;
  coverPadding?: string | number;
  bodyPadding?: string | number;
}

const PreviewCard = ({
  title,
  description,
  descriptionFallback = "暂无描述",
  active = false,
  disabled = false,
  onClick,
  cover,
  status,
  action,
  className,
  style,
  coverPadding = 0,
  bodyPadding = "12px 13px 13px",
}: PreviewCardProps) => {
  const clickable = Boolean(onClick) && !disabled;

  const descriptionNode = (() => {
    const value =
      description == null || description === "" ? descriptionFallback : description;
    if (value == null || value === "") return null;
    if (typeof value === "string") {
      return (
        <div className="mt-1 line-clamp-2 text-[12px] leading-[18px] text-[#6e6e73]">
          {value}
        </div>
      );
    }
    return <div className="mt-1">{value}</div>;
  })();

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!clickable || !onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      className={cx(
        "overflow-hidden rounded-[20px] border bg-white/90 text-left select-none shadow-[0_1px_2px_rgba(0,0,0,0.04),0_18px_40px_rgba(0,0,0,0.055),inset_0_1px_0_rgba(255,255,255,0.88)] backdrop-blur-xl transition",
        clickable
          ? "cursor-pointer hover:-translate-y-[1px] hover:shadow-[0_2px_4px_rgba(0,0,0,0.05),0_22px_48px_rgba(0,0,0,0.075)] active:translate-y-0 active:opacity-90"
          : null,
        disabled ? "cursor-not-allowed opacity-55" : null,
        className,
      )}
      style={{
        borderColor: active ? "rgba(0,122,255,0.46)" : "rgba(255,255,255,0.84)",
        boxShadow: active
          ? "0 0 0 3px rgba(0,122,255,0.24), 0 16px 38px rgba(0,122,255,0.12), inset 0 1px 0 rgba(255,255,255,0.9)"
          : undefined,
        ...style,
      }}
      onClick={() => {
        if (clickable && onClick) onClick();
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        className="h-[178px] overflow-hidden border-b border-[rgba(60,60,67,0.08)] bg-[#f2f2f7]"
        style={{ padding: coverPadding }}
      >
        {cover}
      </div>
      <div style={{ padding: bodyPadding }}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 truncate text-[15px] font-semibold leading-5 text-[#1d1d1f]">
            {title}
          </div>
          {status ? <div className="shrink-0">{status}</div> : null}
        </div>
        {descriptionNode}
        {action ? (
          <div
            className="mt-3"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            {action}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PreviewCard;
