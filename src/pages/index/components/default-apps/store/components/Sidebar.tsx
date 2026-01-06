import { RiAppsLine, RiAppsFill, RiLinksLine, RiLinksFill, RiSearchLine } from "@remixicon/react";
import { Input, Menu } from "antd";
import { FC } from "react";
import { useStoreNavigate, useStoreLocation } from "../context/router";

interface SidebarProps {
  query: string;
  setQuery: (query: string) => void;
}

const Sidebar: FC<SidebarProps> = ({ query, setQuery }) => {
  const navigate = useStoreNavigate();
  const location = useStoreLocation();
  const activeMenu = location.pathname.startsWith("/widget") ? "widget" : "website";

  return (
    <aside className="w-64 shrink-0 border-r pr-4 backdrop-blur-xl flex flex-col h-full">
      <div className="px-2 pt-1 pb-4">
        <div className="text-xs font-medium tracking-wide mb-2">应用商店</div>
        <div className="text-2xl font-bold tracking-tight">探索</div>
      </div>

      <div className="px-2 pb-2">
        <Input
          allowClear
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          prefix={<RiSearchLine size={16} className="" />}
          placeholder="搜索应用与组件"
          className="rounded-xl! border-transparent! transition-all h-10 !"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        <Menu
          mode="inline"
          selectedKeys={[activeMenu]}
          onClick={({ key }) => navigate(`/${key}`)}
          items={[
            {
              key: "website",
              icon: activeMenu === "website" ? <RiLinksFill size={16} /> : <RiLinksLine size={16} />,
              label: "网站",
            },
            {
              key: "widget",
              icon: activeMenu === "widget" ? <RiAppsFill size={16} /> : <RiAppsLine size={16} />,
              label: "小组件",
            },
          ]}
          styles={{
            item: {
              paddingLeft: '16px'
            }
          }}
        />
      </div>

      <div className="mt-auto px-4 py-4 text-xs text-center">
        点击卡片查看详情，点击获取按钮添加到桌面
      </div>
    </aside>
  );
};

export default Sidebar;
