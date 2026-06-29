import { cx } from "@emotion/css";
import type { FC, KeyboardEvent, ReactNode } from "react";

type SettingsIconTone = "blue" | "green" | "orange" | "red" | "purple" | "gray";

export interface MacSettingsViewProps {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}

export const MacSettingsView: FC<MacSettingsViewProps> = ({
  title,
  description,
  action,
  children,
}) => (
  <div className="h-full overflow-y-auto bg-[#f5f5f7] px-6 pb-8 pt-1 dark:bg-[#111113]">
    <div className="mx-auto w-full max-w-[700px]">
      {(title || description || action) && (
        <div className="mb-5 flex items-end justify-between gap-4 pt-1">
          {title || description ? (
            <div className="min-w-0">
              {title ? (
                <div className="truncate text-[28px] font-bold tracking-normal text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {title}
                </div>
              ) : null}
              {description ? (
                <div className="mt-1 text-sm font-medium leading-5 text-[#6e6e73] dark:text-[#aeaeb2]">
                  {description}
                </div>
              ) : null}
            </div>
          ) : null}
          <div className="shrink-0">{action}</div>
        </div>
      )}
      <div className="grid gap-[18px]">{children}</div>
    </div>
  </div>
);

export interface MacSettingsHeroProps {
  icon: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  tone?: SettingsIconTone;
}

export const MacSettingsHero: FC<MacSettingsHeroProps> = ({
  icon,
  title,
  description,
  action,
  tone = "blue",
}) => (
  <div className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-4 overflow-hidden rounded-[20px] border border-white/70 bg-white/80 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.045),inset_0_1px_0_rgba(255,255,255,0.88)] backdrop-blur-xl max-[760px]:grid-cols-[48px_minmax(0,1fr)] dark:border-white/10 dark:bg-white/[0.08] dark:shadow-[0_1px_2px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.08)]">
    <MacSettingsIcon tone={tone} size="large">
      {icon}
    </MacSettingsIcon>
    <div className="min-w-0">
      <div className="truncate text-[18px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
        {title}
      </div>
      {description ? (
        <div className="mt-1 text-[13px] leading-5 text-[#6e6e73] dark:text-[#aeaeb2]">
          {description}
        </div>
      ) : null}
    </div>
    {action ? (
      <div className="shrink-0 max-[760px]:col-start-2">{action}</div>
    ) : null}
  </div>
);

export interface MacSettingsSectionProps {
  title?: ReactNode;
  children: ReactNode;
}

export const MacSettingsSection: FC<MacSettingsSectionProps> = ({
  title,
  children,
}) => (
  <section>
    {title ? (
      <div className="mb-2 ml-1 text-[13px] font-bold text-[#6e6e73] dark:text-[#aeaeb2]">
        {title}
      </div>
    ) : null}
    <div className="overflow-hidden rounded-[14px] border border-white/80 bg-white/80 shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.08] dark:shadow-[0_1px_2px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.08)]">
      {children}
    </div>
  </section>
);

export interface MacSettingsRowProps {
  icon?: ReactNode;
  iconTone?: SettingsIconTone;
  title: ReactNode;
  description?: ReactNode;
  extra?: ReactNode;
  children?: ReactNode;
  onClick?: () => void;
}

export const MacSettingsRow: FC<MacSettingsRowProps> = ({
  icon,
  iconTone = "blue",
  title,
  description,
  extra,
  children,
  onClick,
}) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cx(
        "border-t border-[rgba(60,60,67,0.12)] first:border-t-0 dark:border-white/10",
        onClick
          ? "cursor-pointer transition hover:bg-[#f7f7f9] dark:hover:bg-white/[0.06]"
          : null,
      )}
    >
      <div className="grid min-h-[50px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          {icon ? (
            <MacSettingsIcon tone={iconTone}>{icon}</MacSettingsIcon>
          ) : null}
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              {title}
            </div>
            {description ? (
              <div className="mt-0.5 text-xs leading-[18px] text-[#6e6e73] dark:text-[#aeaeb2]">
                {description}
              </div>
            ) : null}
          </div>
        </div>
        {extra ? <div className="shrink-0">{extra}</div> : null}
      </div>
      {children ? <div className="px-4 pb-4">{children}</div> : null}
    </div>
  );
};

export interface MacSettingsIconProps {
  tone?: SettingsIconTone;
  size?: "default" | "large";
  children: ReactNode;
}

export const MacSettingsIcon: FC<MacSettingsIconProps> = ({
  tone = "blue",
  size = "default",
  children,
}) => (
  <span
    className={cx(
      "grid shrink-0 place-items-center text-white shadow-[0_1px_2px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.35)]",
      size === "large"
        ? "h-[52px] w-[52px] rounded-[14px] text-2xl max-[760px]:h-12 max-[760px]:w-12"
        : "h-[30px] w-[30px] rounded-lg text-[15px]",
      toneClassName[tone],
    )}
  >
    {children}
  </span>
);

export const MacSettingsChevron = () => (
  <span className="text-[20px] leading-none text-[#b0b0b4] dark:text-[#636366]">
    ›
  </span>
);

export const MacSettingsValue: FC<{ children: ReactNode }> = ({ children }) => (
  <span className="max-w-[220px] truncate text-[13px] font-semibold text-[#6e6e73] dark:text-[#aeaeb2]">
    {children}
  </span>
);

export const MacSettingsInfoGrid: FC<{
  items: { label: ReactNode; value: ReactNode }[];
}> = ({ items }) => (
  <div className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
    {items.map((item, index) => (
      <div
        key={index}
        className="rounded-[12px] bg-[#f2f2f7] p-3 dark:bg-white/[0.06]"
      >
        <div className="text-[11px] font-bold text-[#6e6e73] dark:text-[#aeaeb2]">
          {item.label}
        </div>
        <div className="mt-1 truncate text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
          {item.value}
        </div>
      </div>
    ))}
  </div>
);

const toneClassName: Record<SettingsIconTone, string> = {
  blue: "bg-[#007aff]",
  green: "bg-[#34c759]",
  orange: "bg-[#ff9500]",
  red: "bg-[#ff3b30]",
  purple: "bg-[#af52de]",
  gray: "bg-[#8e8e93]",
};
