import { AppRoutedOverlay } from "@/components";
import { FC } from "react";
import ThemeView from "./views/theme";
import WallpaperView from "./views/wallpaper";
import {
  RiLandscapeFill,
  RiLandscapeLine,
  RiTShirtFill,
  RiTShirtLine,
} from "@remixicon/react";

const ThemeModalRoute: FC = () => {
  return (
    <AppRoutedOverlay
      closeTo="/"
      title="个性化"
      wrapContent
      sidebarProps={{
        header: <div className="text-2xl font-bold tracking-tight">个性化</div>,
        menuItems: [
          {
            key: "theme",
            label: "主题",
            path: "/theme",
            icon: <RiTShirtLine size={16} />,
            activeIcon: <RiTShirtFill size={16} />,
          },
          {
            key: "wallpaper",
            label: "壁纸",
            path: "/theme/wallpaper",
            icon: <RiLandscapeLine size={16} />,
            activeIcon: <RiLandscapeFill size={16} />,
          },
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
