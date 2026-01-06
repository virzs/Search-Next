import { configResponsive, useResponsive } from "ahooks";
import { Drawer } from "antd";
import { css, cx } from "@emotion/css";
import { motion } from "framer-motion";
import { FC, Suspense, useState, ReactNode } from "react";
import WebsiteView from "./views/website";
import WidgetView from "./views/widget";
import Sidebar from "./components/Sidebar";
import { DesktopBaseModal } from "zs_library";
import { StoreMemoryRouter, useStoreLocation } from "./context/router";

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
  onAddWebsite?: (site: any) => void;
}

const CachedRoutes: FC<{
  children: ReactNode;
}> = ({ children }) => {
  return <>{children}</>;
};

const CachedRoute: FC<{
  path: string;
  children: ReactNode;
}> = ({ path, children }) => {
  const location = useStoreLocation();
  const isActive = location.pathname.startsWith(path);

  return (
    <div
      style={{
        display: isActive ? "block" : "none",
        height: "100%",
        width: "100%",
      }}
    >
      {children}
    </div>
  );
};

const StoreModalContent: FC<StoreModalProps> = (props) => {
  const { onAddWidget, onAddWebsite } = props;
  const responsive = useResponsive();
  const { lg, xl, xxl } = responsive ?? {};
  const isDesktop = !!(lg || xl || xxl);
  const [query, setQuery] = useState("");
  const location = useStoreLocation();
  const isWebsiteActive = location.pathname.startsWith("/website");

  return (
    <div
      className={cx(
        ["w-full overflow-hidden", isDesktop ? "h-[72vh] min-h-full max-h-[780px]" : "h-full"].join(" ")
      )}
    >
      <div className="flex h-full w-full overflow-hidden backdrop-blur-3xl">
        <Sidebar query={query} setQuery={setQuery} />

        <main className="flex h-full w-0 grow flex-col gap-5 overflow-hidden">
          <div className="h-full w-full overflow-hidden">
            <motion.div
              className="h-full w-full"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Suspense fallback={<div className="p-6 text-sm text-gray-500">Loading...</div>}>
                <CachedRoutes>
                  <CachedRoute path="/website">
                    <WebsiteView
                      active={isWebsiteActive}
                      query={query}
                      onAddWebsite={onAddWebsite}
                    />
                  </CachedRoute>
                  <CachedRoute path="/widget">
                    <WidgetView query={query} onAddWidget={onAddWidget} />
                  </CachedRoute>
                </CachedRoutes>
              </Suspense>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

const StoreModal: FC<StoreModalProps> = (props) => {
  const { open, onClose } = props;
  const responsive = useResponsive();
  const { lg, xl, xxl } = responsive ?? {};
  const isDesktop = !!(lg || xl || xxl);

  const containerProps = {
    title: "应用商店",
    open,
    footer: null,
    onCancel: onClose,
  };

  const body = (
    <StoreMemoryRouter initialEntries={["/website"]}>
      <StoreModalContent {...props} />
    </StoreMemoryRouter>
  );

  const drawer = (
    <Drawer placement="bottom" height="100vh" {...containerProps} styles={{ body: { padding: 0 } }}>
      {body}
    </Drawer>
  );

  const modal = (
    <DesktopBaseModal visible={open} width={1180} onClose={onClose}>
      {body}
    </DesktopBaseModal>
  );

  return <>{isDesktop ? modal : drawer}</>;
};

export default StoreModal;
