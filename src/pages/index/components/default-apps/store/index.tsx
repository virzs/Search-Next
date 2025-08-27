import { RiAppsLine, RiLinksLine } from "@remixicon/react";
import { configResponsive, useResponsive } from "ahooks";
import { Drawer, Menu } from "antd";
import { motion } from "framer-motion";
import { FC, Suspense, useState } from "react";
import WebsiteView from "./views/website";
import WidgetView from "./views/widget";
import { DesktopBaseModal } from "zs_library";
/**
 * 配置响应式断点 hooks
 * 和 tailwindcss 的断点对应
 */
configResponsive({
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
});

interface StoreModalProps {
  open: boolean;
  onClose: () => void;
  onAddWidget?: (widgetId: string) => void;
}

const StoreModal: FC<StoreModalProps> = (props) => {
  const { open, onClose, onAddWidget } = props;

  const responsive = useResponsive();

  const { lg, xl, xxl } = responsive ?? {};

  const [activeMenu, setActiveMenu] = useState("website");

  const body = (
    <div className="flex gap-2 w-full overflow-hidden">
      <div className="w-32 shrink-0">
        <Menu
          mode="inline"
          selectedKeys={[activeMenu]}
          onClick={({ key }) => setActiveMenu(key)}
          items={[
            {
              icon: <RiLinksLine />,
              label: "网站",
              key: "website",
            },
            {
              icon: <RiAppsLine />,
              label: "小组件",
              key: "widget",
            },
          ]}
        />
      </div>
      <div className="grow w-0">
        <motion.div key={activeMenu} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <Suspense fallback={<div>Loading...</div>}>
            {activeMenu === "website" && <WebsiteView />}
            {activeMenu === "widget" && <WidgetView onAddWidget={onAddWidget} />}
          </Suspense>
        </motion.div>
      </div>
    </div>
  );

  const containerProps = {
    title: "应用商店",
    open,
    footer: null,
    onCancel: onClose,
  };

  const drawer = (
    <Drawer placement="bottom" height="100vh" {...containerProps}>
      {body}
    </Drawer>
  );

  const modal = (
    <DesktopBaseModal visible={open} onClose={onClose}>
      {body}
    </DesktopBaseModal>
  );

  return <>{lg || xl || xxl ? modal : drawer}</>;
};

export default StoreModal;
