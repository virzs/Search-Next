import { cx } from "@emotion/css";
import type { SwitchProps } from "antd";
import {
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  type FC,
  type ReactNode,
} from "react";
import {
  AppRoutedHeaderContext,
  AppRoutedPageActiveContext,
} from "@/components/app/routed-container/header-context";
import { AppSwitch } from "@/components/ui";

type SettingsIconTone = "blue" | "green" | "orange" | "red" | "purple" | "gray";

export interface MacSettingsViewProps {
  title?: ReactNode;
  navigationTitle?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  showPageHeader?: boolean;
  children: ReactNode;
}

export const MacSettingsView: FC<MacSettingsViewProps> = ({
  title,
  navigationTitle,
  description,
  action,
  showPageHeader = true,
  children,
}) => {
  const routedHeaderContext = useContext(AppRoutedHeaderContext);
  const isRoutedPageActive = useContext(AppRoutedPageActiveContext);
  const titleIdRef = useRef(Symbol("MacSettingsViewTitle"));
  const effectiveNavigationTitle = navigationTitle ?? title;

  useLayoutEffect(() => {
    if (!routedHeaderContext) return;
    const titleId = titleIdRef.current;

    if (!isRoutedPageActive || !effectiveNavigationTitle) {
      routedHeaderContext.setTitle(titleId, null);
      return;
    }

    routedHeaderContext.setTitle(titleId, effectiveNavigationTitle);
    return () => routedHeaderContext.setTitle(titleId, null);
  }, [effectiveNavigationTitle, isRoutedPageActive, routedHeaderContext]);

  return (
    <div className="h-full overflow-y-auto bg-[var(--sn-page)] px-6 pb-8 pt-1 max-[640px]:px-4">
      <div className="mx-auto w-full max-w-[700px]">
        {showPageHeader && (title || description || action) && (
          <div className="mb-5 flex items-end justify-between gap-4 pt-1">
            {title || description ? (
              <div className="min-w-0">
                {title ? (
                  <div className="truncate text-[28px] font-bold leading-[34px] tracking-normal text-[var(--sn-text)]">
                    {title}
                  </div>
                ) : null}
                {description ? (
                  <div className="mt-1 text-[13px] leading-5 text-[var(--sn-text-secondary)]">
                    {description}
                  </div>
                ) : null}
              </div>
            ) : null}
            <div className="shrink-0">{action}</div>
          </div>
        )}
        <div className="grid min-w-0 gap-[18px]">{children}</div>
      </div>
    </div>
  );
};

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
  <div className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-4 overflow-hidden rounded-[var(--sn-radius-panel)] border border-white/70 bg-white/80 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.045),inset_0_1px_0_rgba(255,255,255,0.88)] backdrop-blur-xl max-[760px]:grid-cols-[48px_minmax(0,1fr)] dark:border-white/10 dark:bg-white/[0.08] dark:shadow-[0_1px_2px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.08)]">
    <MacSettingsIcon tone={tone} size="large">
      {icon}
    </MacSettingsIcon>
    <div className="min-w-0">
      <div className="truncate text-[17px] font-semibold leading-[22px] text-[var(--sn-text)]">
        {title}
      </div>
      {description ? (
        <div className="mt-1 text-[13px] leading-5 text-[var(--sn-text-secondary)]">
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
  <section className="min-w-0">
    {title ? (
      <div className="mb-2 ml-1 text-[13px] font-semibold leading-5 text-[var(--sn-text-secondary)]">
        {title}
      </div>
    ) : null}
    <div className="overflow-hidden rounded-[var(--sn-radius-surface)] border border-white/80 bg-white/80 shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.08] dark:shadow-[0_1px_2px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.08)]">
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
  const content = (
    <>
      <span className="grid min-h-[50px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-2.5 max-[640px]:grid-cols-1 max-[640px]:gap-2">
        <span className="flex min-w-0 items-center gap-3">
          {icon ? (
            <MacSettingsIcon tone={iconTone}>{icon}</MacSettingsIcon>
          ) : null}
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-semibold leading-5 text-[var(--sn-text)]">
              {title}
            </span>
            {description ? (
              <span className="mt-0.5 block break-words text-[12px] leading-[18px] text-[var(--sn-text-secondary)]">
                {description}
              </span>
            ) : null}
          </span>
        </span>
        {extra ? <span className="shrink-0 max-[640px]:pl-[42px]">{extra}</span> : null}
      </span>
      {children ? <span className="block px-4 pb-4">{children}</span> : null}
    </>
  );

  const rowClassName = cx(
    "w-full border-x-0 border-b-0 border-t border-[rgba(60,60,67,0.12)] bg-transparent p-0 text-left font-[inherit] first:border-t-0 dark:border-white/10",
    onClick
      ? "cursor-pointer transition-colors duration-150 hover:bg-[#f7f7f9] active:bg-[#efeff2] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--sn-accent)] motion-reduce:transition-none dark:hover:bg-white/[0.06] dark:active:bg-white/[0.1]"
      : null,
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={rowClassName}>
        {content}
      </button>
    );
  }

  return <div className={rowClassName}>{content}</div>;
};

export interface MacSettingsSwitchRowProps
  extends Omit<MacSettingsRowProps, "extra" | "children" | "onClick"> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  switchProps?: Omit<
    SwitchProps,
    "checked" | "onChange" | "aria-labelledby"
  >;
}

export const MacSettingsSwitchRow: FC<MacSettingsSwitchRowProps> = ({
  title,
  checked,
  onChange,
  switchProps,
  ...rowProps
}) => {
  const titleId = `${useId()}-label`;
  const disabled = switchProps?.disabled || switchProps?.loading;

  return (
    <MacSettingsRow
      {...rowProps}
      title={<span id={titleId}>{title}</span>}
      extra={
        <div
          className={cx(
            "flex min-h-11 min-w-11 items-center justify-center rounded-[var(--sn-radius-control)] transition-transform duration-100 active:scale-[0.97] motion-reduce:transform-none motion-reduce:transition-none",
            disabled ? "cursor-default" : "cursor-pointer",
          )}
          onClick={(event) => {
            if (event.target !== event.currentTarget || disabled) return;
            onChange(!checked);
          }}
        >
          <AppSwitch
            {...switchProps}
            checked={checked}
            aria-labelledby={titleId}
            onChange={onChange}
          />
        </div>
      }
    />
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
        ? "h-[52px] w-[52px] rounded-[var(--sn-radius-surface)] text-2xl max-[760px]:h-12 max-[760px]:w-12"
        : "h-[30px] w-[30px] rounded-[var(--sn-radius-control)] text-[15px]",
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
  <span className="max-w-[220px] truncate text-[13px] font-medium text-[var(--sn-text-secondary)]">
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
        className="rounded-[var(--sn-radius-surface)] bg-[#f2f2f7] p-3 dark:bg-white/[0.06]"
      >
        <div className="text-[11px] font-semibold text-[var(--sn-text-secondary)]">
          {item.label}
        </div>
        <div className="mt-1 truncate text-[13px] font-semibold leading-5 text-[var(--sn-text)]">
          {item.value}
        </div>
      </div>
    ))}
  </div>
);

const toneClassName: Record<SettingsIconTone, string> = {
  blue: "bg-[var(--sn-accent)]",
  green: "bg-[#34c759]",
  orange: "bg-[#ff9500]",
  red: "bg-[#ff3b30]",
  purple: "bg-[#af52de]",
  gray: "bg-[#8e8e93]",
};
