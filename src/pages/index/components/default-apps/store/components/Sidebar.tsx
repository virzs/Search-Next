import { RiAppsLine, RiLinksLine, RiSearchLine } from "@remixicon/react";
import { Input } from "antd";
import { FC } from "react";

interface SidebarProps {
  activeMenu: string;
  setActiveMenu: (key: string) => void;
  query: string;
  setQuery: (query: string) => void;
}

const Sidebar: FC<SidebarProps> = ({ activeMenu, setActiveMenu, query, setQuery }) => {
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
        <div className="space-y-1">
          <button
            onClick={() => setActiveMenu("website")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeMenu === "website"
                ? "bg-(--store-primary-bg) text-(--store-primary)"
                : "text-(--store-text-secondary) hover:bg-(--store-border)"
            }`}
          >
            <RiLinksLine
              size={20}
              className={activeMenu === "website" ? "text-(--store-primary)" : "text-(--store-text-tertiary)"}
            />
            <span>网站</span>
          </button>
          <button
            onClick={() => setActiveMenu("widget")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeMenu === "widget"
                ? "bg-(--store-primary-bg) text-(--store-primary)"
                : "text-(--store-text-secondary) hover:bg-(--store-border)"
            }`}
          >
            <RiAppsLine
              size={20}
              className={activeMenu === "widget" ? "text-(--store-primary)" : "text-(--store-text-tertiary)"}
            />
            <span>小组件</span>
          </button>
        </div>
      </div>

      <div className="mt-auto px-4 py-4 text-xs text-(--store-text-tertiary) text-center">
        点击卡片查看详情，点击获取按钮添加到桌面
      </div>
    </aside>
  );
};

export default Sidebar;
