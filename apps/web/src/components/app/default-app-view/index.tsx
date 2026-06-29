import { cx } from "@emotion/css";
import {
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  type FC,
  type ReactNode,
} from "react";
import {
  AppRoutedHeaderContext,
  AppRoutedPageActiveContext,
} from "../routed-container/header-context";

export interface DefaultAppViewProps {
  className?: string;
  animate?: boolean;
  headerClassName?: string;
  contentClassName?: string;
  title?: ReactNode;
  headerLeft?: ReactNode;
  headerRight?: ReactNode;
  children: ReactNode;
}

type DefaultAppViewHeaderProps = Pick<
  DefaultAppViewProps,
  "headerClassName" | "headerLeft" | "headerRight" | "title"
>;

const DefaultAppViewHeader: FC<DefaultAppViewHeaderProps> = ({
  headerClassName,
  title,
  headerLeft,
  headerRight,
}) => {
  return (
    <div
      className={cx(
        "h-12 max-h-12 min-h-12 w-full shrink-0 flex items-center gap-3 overflow-hidden",
        headerClassName,
      )}
    >
      <div className="min-w-0 flex-1">
        {title && (
          <div className="ml-2 text-base font-bold leading-6 text-[#1d1d1f] dark:text-[#f5f5f7]">
            {title}
          </div>
        )}
        {headerLeft}
      </div>
      {headerRight ? <div className="shrink-0">{headerRight}</div> : null}
    </div>
  );
};

const DefaultAppView: FC<DefaultAppViewProps> = ({
  className,
  animate,
  headerClassName,
  contentClassName,
  title,
  headerLeft,
  headerRight,
  children,
}) => {
  const showHeader =
    Boolean(title) || Boolean(headerLeft) || Boolean(headerRight);
  const routedHeaderContext = useContext(AppRoutedHeaderContext);
  const isRoutedPageActive = useContext(AppRoutedPageActiveContext);
  const headerIdRef = useRef(Symbol("DefaultAppViewHeader"));
  const headerNode = useMemo(
    () =>
      showHeader ? (
        <DefaultAppViewHeader
          headerClassName={headerClassName}
          title={title}
          headerLeft={headerLeft}
          headerRight={headerRight}
        />
      ) : null,
    [headerClassName, headerLeft, headerRight, showHeader, title],
  );
  const useRoutedHeader = Boolean(
    routedHeaderContext &&
      (showHeader || routedHeaderContext.hasHistoryControls),
  );

  useLayoutEffect(() => {
    if (!routedHeaderContext) return;

    const headerId = headerIdRef.current;
    if (!isRoutedPageActive || !headerNode) {
      routedHeaderContext.setHeader(headerId, null);
      return;
    }

    routedHeaderContext.setHeader(headerId, headerNode);
    return () => routedHeaderContext.setHeader(headerId, null);
  }, [headerNode, isRoutedPageActive, routedHeaderContext]);

  return (
    <div
      className={cx(
        "h-full flex flex-col overflow-hidden",
        animate
          ? "animate-in fade-in slide-in-from-right-4 duration-300"
          : null,
        className,
      )}
    >
      {useRoutedHeader ? null : showHeader ? (
        headerNode
      ) : (
        <div className="h-12 min-h-12 shrink-0"></div>
      )}

      <div className={cx("flex-1 overflow-y-auto pt-4", contentClassName)}>
        {children}
      </div>
    </div>
  );
};

export default DefaultAppView;
