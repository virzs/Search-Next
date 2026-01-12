import { Input, Menu } from "antd";
import type { MenuProps } from "antd";
import { cx } from "@emotion/css";
import { FC, ReactNode } from "react";

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
        "w-56 shrink-0 border-r pr-4 backdrop-blur-xl flex flex-col h-full",
        className,
      )}
    >
      {header ? <div className="px-2 pt-1 pb-4">{header}</div> : null}

      {search ? (
        <div className="px-2 pb-2">
          <Input
            allowClear={search.allowClear ?? true}
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
        <div className="flex-1" />
      )}

      {footer ? (
        <div className="mt-auto px-4 py-4 text-xs text-center">{footer}</div>
      ) : null}
    </aside>
  );
};

export default AppSidebar;
