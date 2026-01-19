import { cx } from "@emotion/css";
import type { FC, ReactNode } from "react";

export interface AppContentContainerProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
  title?: ReactNode;
  headerExtra?: ReactNode;
  headerClassName?: string;
  contentClassName?: string;
}

const AppContentContainer: FC<AppContentContainerProps> = ({
  children,
  className,
  animate,
  title,
  headerExtra,
  headerClassName,
  contentClassName,
}) => {
  const showHeader = Boolean(title) || Boolean(headerExtra);

  return (
    <div
      className={cx(
        "flex flex-col overflow-hidden",
        animate
          ? "animate-in fade-in slide-in-from-right-4 duration-300"
          : null,
        className,
      )}
    >
      {showHeader ? (
        <div
          className={cx(
            "shrink-0 flex items-center gap-2 p-4 pb-2",
            headerClassName,
          )}
        >
          {title ? <div className="min-w-0">{title}</div> : null}
          {headerExtra ? (
            <div className="ml-auto shrink-0">{headerExtra}</div>
          ) : null}
        </div>
      ) : null}

      <div className={cx("flex-1 overflow-y-auto", contentClassName)}>
        {children}
      </div>
    </div>
  );
};

export default AppContentContainer;
