import { Drawer } from "antd";
import type { DrawerProps } from "antd";
import { configResponsive, useResponsive } from "ahooks";
import { FC, ReactNode } from "react";
import { DesktopBaseModal } from "zs_library";

export interface AppResponsiveOverlayProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  isDesktop?: boolean;
  drawerProps?: Partial<DrawerProps>;
  modalProps?: Partial<React.ComponentProps<typeof DesktopBaseModal>>;
  children: ReactNode;
}

configResponsive({
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
});

const AppResponsiveOverlay: FC<AppResponsiveOverlayProps> = ({ open, onClose, title, isDesktop, drawerProps, modalProps, children }) => {
  const responsive = useResponsive();
  const { lg, xl, xxl } = responsive ?? {};
  const computedIsDesktop = !!(lg || xl || xxl);
  const resolvedIsDesktop = isDesktop ?? computedIsDesktop;

  const defaultDrawerStyles = { body: { padding: 0 } } as DrawerProps["styles"];
  const mergedDrawerStyles = {
    ...(defaultDrawerStyles as any),
    ...(drawerProps?.styles as any),
    body: {
      ...((defaultDrawerStyles as any)?.body || {}),
      ...((drawerProps?.styles as any)?.body || {}),
    },
  } as DrawerProps["styles"];

  if (resolvedIsDesktop) {
    return (
      <DesktopBaseModal
        {...modalProps}
        visible={modalProps?.visible ?? open}
        onClose={modalProps?.onClose ?? onClose}
        width={modalProps?.width ?? 1180}
      >
        {children}
      </DesktopBaseModal>
    );
  }

  return (
    <Drawer
      {...drawerProps}
      open={drawerProps?.open ?? open}
      onClose={drawerProps?.onClose ?? onClose}
      title={drawerProps?.title ?? title}
      footer={drawerProps?.footer ?? null}
      placement={drawerProps?.placement ?? "bottom"}
      height={drawerProps?.height ?? "100vh"}
      styles={mergedDrawerStyles}
    >
      {children}
    </Drawer>
  );
};

export default AppResponsiveOverlay;
