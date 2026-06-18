import { AppRoutedOverlay } from "@/components";
import { FC } from "react";
import {
  RiLandscapeFill,
  RiLandscapeLine,
  RiTShirtFill,
  RiTShirtLine,
  RiUserFill,
  RiUserLine,
} from "@remixicon/react";
import { personalizationRoute } from "./route-paths";

const PersonalizationModalRoute: FC = () => {
  return (
    <AppRoutedOverlay
      closeTo="/"
      title="个性化"
      wrapContent
      componentSize="small"
      keepAlive={{ enabled: true }}
      overlayProps={{
        modalProps: { width: 940 },
      }}
      sidebarProps={{
        menuItems: [
          {
            key: "theme",
            label: "主题",
            path: personalizationRoute.path.root,
            icon: <RiTShirtLine size={16} />,
            activeIcon: <RiTShirtFill size={16} />,
          },
          {
            key: "wallpaper",
            label: "壁纸",
            path: personalizationRoute.path.wallpaper,
            icon: <RiLandscapeLine size={16} />,
            activeIcon: <RiLandscapeFill size={16} />,
          },
          {
            key: "my",
            label: "我的",
            path: personalizationRoute.path.my,
            icon: <RiUserLine size={16} />,
            activeIcon: <RiUserFill size={16} />,
          },
        ],
        menuStyles: {
          item: {
            height: 32,
            lineHeight: "32px",
            paddingLeft: 14,
          },
        },
      }}
    />
  );
};

export default PersonalizationModalRoute;
