import { RiAppsLine, RiAppsFill, RiLinksLine, RiLinksFill, RiSearchLine } from "@remixicon/react";
import { Input, Menu } from "antd";
import { FC } from "react";
import { css } from "@emotion/css";
import { useStoreNavigate, useStoreLocation } from "../context/router";

interface SidebarProps {
  query: string;
  setQuery: (query: string) => void;
}

const Sidebar: FC<SidebarProps> = ({ query, setQuery }) => {
  const navigate = useStoreNavigate();
  const location = useStoreLocation();
  const activeMenu = location.pathname.startsWith("/widget") ? "widget" : "website";

  const menuClassName = css`
    &.ant-menu {
      background: transparent !important;
      border-inline-end: 0 !important;
    }

    .ant-menu-item {
      margin-inline: 0 !important;
      margin-bottom: 2px !important;
      border-radius: 0.75rem !important; /* rounded-xl */
      height: 44px !important;
      line-height: 44px !important;
      padding-inline: 12px !important;
      color: var(--store-text-secondary) !important;
      transition: all 0.2s cubic-bezier(0.2, 0, 0, 1) !important;

      &:hover {
        background-color: var(--store-border) !important;
        /* color: var(--store-text-primary) !important; */
      }

      &:active {
        transform: scale(0.96);
      }

      &.ant-menu-item-selected {
        /* background-color: rgba(0, 0, 0, 0.06) !important; */
        /* color: var(--store-primary) !important; */
        /* font-weight: 600; */
      }

      .ant-menu-item-icon {
        font-size: 20px !important;
        min-width: 20px !important;
        margin-inline-end: 12px !important;
        color: var(--store-text-tertiary);
        transition: color 0.2s;
      }

      &:hover .ant-menu-item-icon {
        color: var(--store-text-secondary);
      }

      &.ant-menu-item-selected .ant-menu-item-icon {
        /* color: var(--store-primary); */
      }
    }
  `;

  return (
    <aside className="w-64 shrink-0 border-r border-(--store-border) pr-4 backdrop-blur-xl flex flex-col h-full">
      <div className="px-2 pt-1 pb-4">
        <div className="text-xs font-medium tracking-wide text-(--store-text-tertiary) mb-2">应用商店</div>
        <div className="text-2xl font-bold text-(--store-text-primary) tracking-tight">探索</div>
      </div>

      <div className="px-2 pb-6">
        <Input
          allowClear
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          prefix={<RiSearchLine size={16} className="text-(--store-text-tertiary)" />}
          placeholder="搜索应用与组件"
          className="rounded-xl! bg-(--store-border)! border-transparent! hover:bg-(--store-border)! focus:bg-(--store-bg-card)! focus:border-(--store-primary)! focus:shadow-[0_0_0_2px_rgba(59,130,246,0.1)]! transition-all h-10 text-(--store-text-primary)!"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        <Menu
          mode="inline"
          selectedKeys={[activeMenu]}
          onClick={({ key }) => navigate(`/${key}`)}
          className={menuClassName}
          items={[
            {
              key: "website",
              icon: activeMenu === "website" ? <RiLinksFill size={20} /> : <RiLinksLine size={20} />,
              label: "网站",
            },
            {
              key: "widget",
              icon: activeMenu === "widget" ? <RiAppsFill size={20} /> : <RiAppsLine size={20} />,
              label: "小组件",
            },
          ]}
        />
      </div>

      <div className="mt-auto px-4 py-4 text-xs text-(--store-text-tertiary) text-center">
        点击卡片查看详情，点击获取按钮添加到桌面
      </div>
    </aside>
  );
};

export default Sidebar;
