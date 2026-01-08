import { AppRouteModal } from "@/components";
import { FC } from "react";
import ThemeView from "./views/theme";
import WallpaperView from "./views/wallpaper";

const ThemeModalRoute: FC = () => {
  return (
    <AppRouteModal
      closeTo="/"
      title="个性化"
      wrapContent
      sidebarProps={{
        header: <div className="text-2xl font-bold tracking-tight">个性化</div>,
        menuItems: [
          { key: "theme", label: "主题", path: "/theme" },
          { key: "wallpaper", label: "壁纸", path: "/theme/wallpaper" },
        ],
      }}
      outletWrapperClassName="h-full w-full overflow-auto p-6"
    />
  );
};

export const themeRoutes = {
  path: "theme",
  element: <ThemeModalRoute />,
  children: [
    { index: true, element: <ThemeView /> },
    { path: "wallpaper", element: <WallpaperView /> },
  ],
};

export default ThemeModalRoute;
