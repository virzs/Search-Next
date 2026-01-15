import { cx } from "@emotion/css";
import type { FC, ReactNode } from "react";

export interface DefaultAppViewProps {
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  headerLeft?: ReactNode;
  headerRight?: ReactNode;
  children: ReactNode;
}

const DefaultAppView: FC<DefaultAppViewProps> = ({
  className,
  headerClassName,
  contentClassName,
  headerLeft,
  headerRight,
  children,
}) => {
  const showHeader = Boolean(headerLeft) || Boolean(headerRight);

  return (
    <div className={cx("h-full flex flex-col overflow-hidden", className)}>
      {showHeader ? (
        <div
          className={cx(
            "shrink-0 flex items-start gap-3",
            headerClassName,
          )}
        >
          <div className="min-w-0 flex-1">{headerLeft}</div>
          {headerRight ? <div className="shrink-0">{headerRight}</div> : null}
        </div>
      ) : null}

      <div className={cx("flex-1 overflow-hidden pt-4", contentClassName)}>
        {children}
      </div>
    </div>
  );
};

export default DefaultAppView;
