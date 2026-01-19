import { AppRoutedOverlay } from "@/components";
import { FC } from "react";
import {
  RiLandscapeFill,
  RiLandscapeLine,
  RiTShirtFill,
  RiTShirtLine,
} from "@remixicon/react";
import { themeRoute } from "./route-paths";

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
            path: themeRoute.path.root,
            icon: <RiTShirtLine size={16} />,
            activeIcon: <RiTShirtFill size={16} />,
          },
          {
            key: "wallpaper",
            label: "壁纸",
            path: themeRoute.path.wallpaper,
            icon: <RiLandscapeLine size={16} />,
            activeIcon: <RiLandscapeFill size={16} />,
          },
        ],
      }}
      outletWrapperClassName="h-full w-full overflow-auto"
    />
  );
};

export default ThemeModalRoute;
