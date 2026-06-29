import {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router";
import AppResponsiveOverlay, {
  AppResponsiveOverlayProps,
} from "../responsive-overlay";
import AppSidebar, { AppSidebarProps } from "../sidebar";
import { Button, ConfigProvider } from "antd";
import type { ConfigProviderProps } from "antd";
import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react";
import { css, cx } from "@emotion/css";
import { AppRoutedHeaderContext } from "./header-context";

export interface AppRoutedContainerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  wrapContent?: boolean;
  componentSize?: ConfigProviderProps["componentSize"];
  overlayProps?: Partial<AppResponsiveOverlayProps>;
  sidebarProps?: AppSidebarProps;
  children: ReactNode;
}

const AppRoutedContainer: FC<AppRoutedContainerProps> = ({
  open,
  onClose,
  title,
  wrapContent,
  componentSize,
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
  }, [
    basePath,
    location.hash,
    location.pathname,
    location.search,
    navigationType,
  ]);

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

  const showHistoryControls = Boolean(
    basePath && basePath !== "/" && location.pathname.startsWith(basePath),
  );
  const [viewHeader, setViewHeader] = useState<ReactNode | null>(null);
  const activeHeaderIdRef = useRef<symbol | null>(null);

  const setHeader = useCallback((id: symbol, header: ReactNode | null) => {
    if (header) {
      activeHeaderIdRef.current = id;
      setViewHeader(header);
      return;
    }

    if (activeHeaderIdRef.current === id) {
      activeHeaderIdRef.current = null;
      setViewHeader(null);
    }
  }, []);

  const headerContextValue = useMemo(
    () => ({
      hasHistoryControls: showHistoryControls,
      setHeader,
    }),
    [setHeader, showHistoryControls],
  );

  const showHeaderRow = showHistoryControls || Boolean(viewHeader);

  return (
    <AppResponsiveOverlay
      {...overlayProps}
      contentClassName={cx(
        overlayProps?.contentClassName,
        css`
          background: #f5f5f7;

          [data-theme="dark"] & {
            background: #111113;
          }
        `,
      )}
      open={overlayProps?.open ?? open}
      onClose={overlayProps?.onClose ?? onClose}
      title={overlayProps?.title ?? title}
      wrapContent={overlayProps?.wrapContent ?? wrapContent}
      modalProps={{
        ...overlayProps?.modalProps,
        classNames: {
          ...overlayProps?.modalProps?.classNames,
          body: css`
            padding: 0;
          `,
        },
        styles: {
          ...overlayProps?.modalProps?.styles,
          body: {
            ...overlayProps?.modalProps?.styles?.body,
            padding: 0,
          },
          inner: {
            width: "100%",
            ...overlayProps?.modalProps?.styles?.inner,
          },
        },
      }}
    >
      <ConfigProvider componentSize={componentSize}>
        <div className="flex h-full w-full overflow-hidden">
          {sidebarProps ? <AppSidebar {...sidebarProps} /> : null}
          <div className="flex h-full w-0 grow flex-col overflow-hidden">
            <AppRoutedHeaderContext.Provider value={headerContextValue}>
              {showHeaderRow ? (
                <div className={routedHeaderClassName}>
                  {showHistoryControls ? (
                    <div className={historyControlsClassName}>
                      <Button
                        type="text"
                        size="small"
                        aria-label="后退"
                        className="app-history-button"
                        icon={<RiArrowLeftLine size={16} />}
                        disabled={!canBack}
                        onClick={handleBack}
                      />
                      <Button
                        type="text"
                        size="small"
                        aria-label="前进"
                        className="app-history-button"
                        icon={<RiArrowRightLine size={16} />}
                        disabled={!canForward}
                        onClick={handleForward}
                      />
                    </div>
                  ) : null}
                  {viewHeader ? (
                    <div className="min-w-0 flex-1">{viewHeader}</div>
                  ) : (
                    <div className="min-w-0 flex-1" />
                  )}
                </div>
              ) : null}
              <div className="relative min-h-0 flex-1 overflow-hidden">
                {children}
              </div>
            </AppRoutedHeaderContext.Provider>
          </div>
        </div>
      </ConfigProvider>
    </AppResponsiveOverlay>
  );
};

export default AppRoutedContainer;

const routedHeaderClassName = css`
  position: relative;
  z-index: 20;
  display: flex;
  width: 100%;
  flex-shrink: 0;
  align-items: center;
  height: 48px;
  min-height: 48px;
  max-height: 48px;
  overflow: hidden;
  background: transparent;
`;

const historyControlsClassName = css`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 6px;
  padding: 10px 0 10px 12px;

  .app-history-button {
    width: 28px !important;
    height: 28px !important;
    border: 0 !important;
    border-radius: 999px !important;
    background: transparent !important;
    color: #5f6368 !important;
    box-shadow: none !important;
  }

  .app-history-button:not(:disabled):not(.ant-btn-disabled):hover {
    background: rgba(60, 60, 67, 0.08) !important;
    color: #1d1d1f !important;
  }

  .app-history-button:disabled,
  .app-history-button.ant-btn-disabled {
    opacity: 0.38;
    color: #6e6e73 !important;
    background: transparent !important;
  }

  [data-theme="dark"] & .app-history-button {
    color: #d1d1d6 !important;
  }

  [data-theme="dark"] &
    .app-history-button:not(:disabled):not(.ant-btn-disabled):hover {
    background: rgba(235, 235, 245, 0.12) !important;
    color: #f5f5f7 !important;
  }

  [data-theme="dark"] & .app-history-button:disabled,
  [data-theme="dark"] & .app-history-button.ant-btn-disabled {
    color: #8e8e93 !important;
  }
`;
