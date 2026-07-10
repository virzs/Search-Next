import { cx } from "@emotion/css";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { RiCheckLine } from "@remixicon/react";
import { useI18n } from "@/i18n";

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
  descriptionFallback,
  active = false,
  disabled = false,
  onClick,
  cover,
  status,
  action,
  className,
  style,
  coverPadding = 0,
  bodyPadding = "13px 14px 14px",
}: PreviewCardProps) => {
  const { t } = useI18n();
  const clickable = Boolean(onClick) && !disabled;
  const fallbackDescription = descriptionFallback ?? t("ui.noDescription");

  const descriptionNode = (() => {
    const value =
      description == null || description === "" ? fallbackDescription : description;
    if (value == null || value === "") return null;
    if (typeof value === "string") {
      return (
        <div className="mt-1 line-clamp-2 text-[12px] leading-[18px] text-[var(--sn-text-secondary)]">
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
        "relative flex min-h-full flex-col overflow-hidden rounded-[12px] border bg-[var(--sn-surface)] text-left select-none shadow-[var(--sn-shadow)] transition-[transform,box-shadow,background-color] duration-200",
        clickable
          ? "cursor-pointer hover:-translate-y-px hover:bg-[var(--sn-surface-strong)] hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)] active:translate-y-0 active:scale-[0.99]"
          : null,
        disabled ? "cursor-not-allowed opacity-55" : null,
        className,
      )}
      style={{
        borderColor: active ? "transparent" : "var(--sn-separator)",
        boxShadow: active
          ? "0 0 0 2px var(--sn-accent), 0 10px 26px color-mix(in srgb, var(--sn-accent) 11%, transparent)"
          : undefined,
        ...style,
      }}
      onClick={() => {
        if (clickable && onClick) onClick();
      }}
      onKeyDown={handleKeyDown}
    >
      {active ? (
        <span
          aria-label={t("ui.current")}
          className="absolute right-3 top-3 z-[2] grid h-7 w-7 place-items-center rounded-full border border-white/60 bg-[var(--sn-accent)] text-white shadow-[0_4px_12px_rgba(0,0,0,0.16)]"
        >
          <RiCheckLine size={17} />
        </span>
      ) : status ? (
        <div className="absolute right-3 top-3 z-[2]">{status}</div>
      ) : null}
      <div
        className="aspect-[16/9] overflow-hidden border-b border-[var(--sn-separator)] bg-[var(--sn-surface-secondary)]"
        style={{ padding: coverPadding }}
      >
        {cover}
      </div>
      <div className="flex min-h-[74px] flex-1 items-center gap-3" style={{ padding: bodyPadding }}>
        <div className="min-w-0 flex-1 self-start">
          <div className="truncate text-[15px] font-semibold leading-5 text-[var(--sn-text)]">
            {title}
          </div>
          {descriptionNode}
        </div>
        {action ? (
          <div
            className="shrink-0 self-center"
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
