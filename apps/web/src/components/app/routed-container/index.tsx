import { FC, ReactNode, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router";
import AppResponsiveOverlay, { AppResponsiveOverlayProps } from "../responsive-overlay";
import AppSidebar, { AppSidebarProps } from "../sidebar";
import { Button } from "antd";
import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react";

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
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();

  const basePathRef = useRef<string | null>(null);
  if (!basePathRef.current) {
    const firstSegment = location.pathname.split("/").filter(Boolean)[0] ?? "";
    basePathRef.current = firstSegment ? `/${firstSegment}` : "/";
  }
  const basePath = basePathRef.current;

  const initialEntryRef = useRef<string | null>(null);
  if (!initialEntryRef.current) {
    initialEntryRef.current = `${location.pathname}${location.search}${location.hash}`;
  }
  const stackRef = useRef<string[]>([initialEntryRef.current]);
  const indexRef = useRef(0);
  const [stack, setStack] = useState<string[]>(stackRef.current);
  const [activeIndex, setActiveIndex] = useState(indexRef.current);

  useEffect(() => {
    if (!basePath || basePath === "/") return;
    const current = `${location.pathname}${location.search}${location.hash}`;
    if (!current.startsWith(basePath)) return;

    const existingIndex = stackRef.current.indexOf(current);

    if (navigationType === "POP") {
      if (existingIndex !== -1) {
        indexRef.current = existingIndex;
        setActiveIndex(existingIndex);
        return;
      }
      stackRef.current = [current];
      indexRef.current = 0;
      setStack(stackRef.current);
      setActiveIndex(0);
      return;
    }

    if (navigationType === "REPLACE") {
      if (existingIndex !== -1) {
        indexRef.current = existingIndex;
        setActiveIndex(existingIndex);
        return;
      }
      const nextStack = stackRef.current.slice();
      nextStack[indexRef.current] = current;
      stackRef.current = nextStack;
      setStack(nextStack);
      return;
    }

    if (existingIndex !== -1) {
      indexRef.current = existingIndex;
      setActiveIndex(existingIndex);
      return;
    }

    const nextStack = stackRef.current
      .slice(0, indexRef.current + 1)
      .concat(current);
    stackRef.current = nextStack;
    indexRef.current = nextStack.length - 1;
    setStack(nextStack);
    setActiveIndex(indexRef.current);
  }, [basePath, location.hash, location.pathname, location.search, navigationType]);

  const canBack = activeIndex > 0;
  const canForward = activeIndex < stack.length - 1;

  const handleBack = () => {
    if (!canBack) return;
    const nextIndex = indexRef.current - 1;
    indexRef.current = nextIndex;
    setActiveIndex(nextIndex);
    navigate(stackRef.current[nextIndex], { replace: true });
  };

  const handleForward = () => {
    if (!canForward) return;
    const nextIndex = indexRef.current + 1;
    indexRef.current = nextIndex;
    setActiveIndex(nextIndex);
    navigate(stackRef.current[nextIndex], { replace: true });
  };

  const showHistoryControls =
    basePath && basePath !== "/" && location.pathname.startsWith(basePath);

  return (
    <AppResponsiveOverlay
      {...overlayProps}
      open={overlayProps?.open ?? open}
      onClose={overlayProps?.onClose ?? onClose}
      title={overlayProps?.title ?? title}
      wrapContent={overlayProps?.wrapContent ?? wrapContent}
    >
      <div className="flex h-full w-full overflow-hidden">
        {sidebarProps ? <AppSidebar {...sidebarProps} /> : null}
        <div className="h-full w-0 grow overflow-hidden relative">
          {showHistoryControls ? (
            <div className="absolute left-0 top-0 z-20 flex items-center gap-1 rounded-full border border-black/10 bg-white/7 backdrop-blur-md px-1 py-1 shadow-sm">
              <Button
                type="text"
                size="small"
                className="rounded-full!"
                icon={<RiArrowLeftLine size={16} />}
                disabled={!canBack}
                onClick={handleBack}
              />
              <Button
                type="text"
                size="small"
                className="rounded-full!"
                icon={<RiArrowRightLine size={16} />}
                disabled={!canForward}
                onClick={handleForward}
              />
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </AppResponsiveOverlay>
  );
};

export default AppRoutedContainer;
