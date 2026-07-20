import { cx } from "@emotion/css";
import { useId, type CSSProperties, type ReactNode } from "react";
import { RiCheckLine } from "@remixicon/react";
import { useI18n } from "@/i18n";
import { AppButton, type AppButtonProps } from "@/components/ui";

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
  const titleId = useId();
  const descriptionId = useId();
  const hasPrimaryAction = Boolean(onClick);
  const clickable = hasPrimaryAction && !disabled;
  const fallbackDescription = descriptionFallback ?? t("ui.noDescription");
  const descriptionValue =
    description == null || description === ""
      ? fallbackDescription
      : description;

  const descriptionNode = (() => {
    if (descriptionValue == null || descriptionValue === "") return null;
    if (typeof descriptionValue === "string") {
      return (
        <div
          id={descriptionId}
          className="mt-1 line-clamp-2 text-[12px] leading-[18px] text-[var(--sn-text-secondary)]"
        >
          {descriptionValue}
        </div>
      );
    }
    return (
      <div id={descriptionId} className="mt-1">
        {descriptionValue}
      </div>
    );
  })();

  const content = (
    <>
      <div
        className="aspect-[16/9] overflow-hidden border-b border-[var(--sn-separator)] bg-[var(--sn-surface-secondary)]"
        style={{ padding: coverPadding }}
      >
        {cover}
      </div>
      <div
        className="flex min-h-[74px] flex-1 items-center"
        style={{
          padding: bodyPadding,
          paddingInlineEnd: action ? "104px" : undefined,
        }}
      >
        <div className="min-w-0 flex-1 self-start">
          <div
            id={titleId}
            className="truncate text-[15px] font-semibold leading-5 text-[var(--sn-text)]"
          >
            {title}
          </div>
          {descriptionNode}
        </div>
      </div>
    </>
  );

  return (
    <article
      aria-disabled={disabled || undefined}
      className={cx(
        "relative flex min-h-full flex-col overflow-hidden rounded-[var(--sn-radius-surface)] border bg-[var(--sn-surface)] text-left select-none shadow-[var(--sn-shadow)] transition-[transform,box-shadow,background-color] duration-200 motion-reduce:transform-none motion-reduce:transition-none",
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
    >
      {active ? (
        <span
          className="absolute right-3 top-3 z-[3] grid h-7 w-7 place-items-center rounded-[var(--sn-radius-round)] border border-white/60 bg-[var(--sn-accent)] text-[var(--sn-on-accent)] shadow-[0_4px_12px_rgba(0,0,0,0.16)]"
        >
          <RiCheckLine size={17} aria-hidden="true" />
          <span className="sr-only">{t("ui.current")}</span>
        </span>
      ) : status ? (
        <div className="absolute right-3 top-3 z-[3]">{status}</div>
      ) : null}
      {hasPrimaryAction ? (
        <button
          type="button"
          disabled={disabled}
          aria-labelledby={titleId}
          aria-describedby={descriptionNode ? descriptionId : undefined}
          className="flex min-h-full w-full flex-1 flex-col rounded-[var(--sn-radius-surface)] border-0 bg-transparent p-0 text-left font-inherit text-inherit outline-none focus-visible:outline-[3px] focus-visible:outline-offset-[-3px] focus-visible:outline-[var(--sn-accent)]"
          onClick={onClick}
        >
          {content}
        </button>
      ) : (
        <div className="flex min-h-full w-full flex-1 flex-col">{content}</div>
      )}
      {action ? (
        <div className="absolute bottom-0 right-0 z-[3] flex min-h-[74px] items-center pr-[14px]">
          {action}
        </div>
      ) : null}
    </article>
  );
};

type PreviewCardActionProps = Omit<AppButtonProps, "block" | "size">;

export const PreviewCardAction = ({
  className,
  intent = "primary",
  ...props
}: PreviewCardActionProps) => (
  <AppButton
    {...props}
    intent={intent}
    size="small"
    className={className}
  />
);

export default PreviewCard;
