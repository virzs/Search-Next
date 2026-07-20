import { Menu } from "antd";
import type { MenuProps } from "antd";
import { css, cx } from "@emotion/css";
import { FC, ReactNode } from "react";
import { AppInput } from "@/components/ui";

export interface AppSidebarMenuItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  activeIcon?: ReactNode;
  disabled?: boolean;
}

export interface AppSidebarSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allowClear?: boolean;
  prefix?: ReactNode;
  inputClassName?: string;
}

export interface AppSidebarProps {
  header?: ReactNode;
  search?: AppSidebarSearchProps;
  menuItems?: AppSidebarMenuItem[];
  activeMenuKey?: string;
  onMenuSelect?: (key: string) => void;
  emptyText?: ReactNode;
  footer?: ReactNode;
  className?: string;
  menuStyles?: MenuProps["styles"];
}

const AppSidebar: FC<AppSidebarProps> = ({
  header,
  search,
  menuItems,
  activeMenuKey,
  onMenuSelect,
  emptyText = "没有匹配项",
  footer,
  className,
  menuStyles,
}) => {
  const items: MenuProps["items"] = (menuItems || []).map((item) => ({
    key: item.key,
    label: item.label,
    disabled: item.disabled,
    icon:
      activeMenuKey === item.key ? (item.activeIcon ?? item.icon) : item.icon,
  }));

  return (
    <aside
      className={cx(
        "w-56 shrink-0 flex flex-col h-full max-[640px]:w-36",
        appSidebarClassName,
        className,
      )}
    >
      {header ? (
        <div className="app-sidebar-header px-2 pt-1 pb-4">{header}</div>
      ) : null}

      {search ? (
        <div className="px-2 pb-2">
          <AppInput
            size="small"
            allowClear={search.allowClear ?? true}
            aria-label={search.placeholder ?? "搜索"}
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            prefix={search.prefix}
            placeholder={search.placeholder}
            className={search.inputClassName}
          />
        </div>
      ) : null}

      {items.length ? (
        <div className="flex-1 overflow-y-auto px-2">
          <Menu
            mode="inline"
            selectedKeys={activeMenuKey ? [activeMenuKey] : undefined}
            onClick={({ key }) => onMenuSelect?.(String(key))}
            items={items}
            styles={
              menuStyles ?? {
                item: {
                  paddingLeft: "16px",
                },
              }
            }
          />
        </div>
      ) : (
        <div className="flex-1 px-4 py-5 text-center text-xs font-semibold text-[rgba(60,60,67,0.54)]">
          {emptyText}
        </div>
      )}

      {footer ? (
        <div className="mt-auto px-4 py-4 text-xs text-center">{footer}</div>
      ) : null}
    </aside>
  );
};

export default AppSidebar;

const appSidebarClassName = css`
  padding: 58px 10px 16px;
  background:
    linear-gradient(
      180deg,
      rgba(246, 245, 243, 0.88),
      rgba(235, 233, 230, 0.82)
    ),
    rgba(242, 240, 237, 0.78);
  border-right: 1px solid rgba(60, 60, 67, 0.12);
  box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.54);
  color: #1d1d1f;
  backdrop-filter: blur(30px) saturate(1.18);

  @media (max-width: 640px) {
    padding: 54px 6px 14px;
  }

  .app-sidebar-header,
  .app-sidebar-header [class*="text-gray-950"],
  .app-sidebar-header [class*="dark:text-gray-50"] {
    color: #1d1d1f !important;
  }

  .app-sidebar-header [class*="text-gray-500"],
  .app-sidebar-header [class*="dark:text-gray-400"] {
    color: rgba(60, 60, 67, 0.64) !important;
  }

  .ant-menu {
    border-inline-end: 0 !important;
    background: transparent;
  }

  .ant-menu:focus-visible {
    outline: none;
  }

  .ant-menu-item {
    height: 38px;
    line-height: 38px;
    margin: 2px 0;
    border-radius: var(--sn-radius-compact);
    color: #1d1d1f;
    font-size: 13px;
    font-weight: 600;
  }

  .ant-menu-item .ant-menu-item-icon,
  .ant-menu-item svg {
    color: var(--sn-accent-text);
  }

  .ant-menu-item:hover {
    background: rgba(60, 60, 67, 0.07) !important;
    color: #1d1d1f !important;
  }

  .ant-menu-item-selected {
    background: rgba(255, 255, 255, 0.62) !important;
    color: #1d1d1f !important;
    font-weight: 700;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.82),
      0 1px 2px rgba(0, 0, 0, 0.06);
  }

  .ant-menu-item-selected::after {
    display: none;
  }

  [data-theme="dark"] & {
    background:
      linear-gradient(
        180deg,
        rgba(38, 38, 41, 0.9),
        rgba(28, 28, 30, 0.84)
      ),
      rgba(28, 28, 30, 0.78);
    border-right-color: rgba(235, 235, 245, 0.1);
    box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.05);
    color: #f5f5f7;
  }

  [data-theme="dark"] & .app-sidebar-header,
  [data-theme="dark"] & .app-sidebar-header [class*="text-gray-950"],
  [data-theme="dark"] & .app-sidebar-header [class*="dark:text-gray-50"] {
    color: #f5f5f7 !important;
  }

  [data-theme="dark"] & .app-sidebar-header [class*="text-gray-500"],
  [data-theme="dark"] & .app-sidebar-header [class*="dark:text-gray-400"] {
    color: rgba(235, 235, 245, 0.62) !important;
  }

  [data-theme="dark"] & .ant-menu-item {
    color: #f5f5f7;
  }

  [data-theme="dark"] & .ant-menu-item:hover {
    background: rgba(235, 235, 245, 0.1) !important;
    color: #ffffff !important;
  }

  [data-theme="dark"] & .ant-menu-item-selected {
    background: rgba(255, 255, 255, 0.13) !important;
    color: #ffffff !important;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      0 1px 2px rgba(0, 0, 0, 0.24);
  }
`;
