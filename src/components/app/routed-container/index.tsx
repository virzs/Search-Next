import { FC, ReactNode } from "react";
import AppResponsiveOverlay, { AppResponsiveOverlayProps } from "../responsive-overlay";
import AppSidebar, { AppSidebarProps } from "../sidebar";

export interface AppRoutedContainerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  wrapContent?: boolean;
  overlayProps?: Partial<AppResponsiveOverlayProps>;
  sidebarProps?: AppSidebarProps;
  children: ReactNode;
}

const AppRoutedContainer: FC<AppRoutedContainerProps> = ({
  open,
  onClose,
  title,
  wrapContent,
  overlayProps,
  sidebarProps,
  children,
}) => {
  return (
    <AppResponsiveOverlay
      {...overlayProps}
      open={overlayProps?.open ?? open}
      onClose={overlayProps?.onClose ?? onClose}
      title={overlayProps?.title ?? title}
      wrapContent={overlayProps?.wrapContent ?? wrapContent}
    >
      <div className="flex h-full w-full overflow-hidden backdrop-blur-3xl">
        {sidebarProps ? <AppSidebar {...sidebarProps} /> : null}
        <div className="h-full w-0 grow overflow-hidden">{children}</div>
      </div>
    </AppResponsiveOverlay>
  );
};

export default AppRoutedContainer;

