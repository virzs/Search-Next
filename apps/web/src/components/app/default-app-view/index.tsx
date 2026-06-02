import { cx } from "@emotion/css";
import type { FC, ReactNode } from "react";

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
      {showHeader ? (
        <div className={cx("shrink-0 flex items-start gap-3", headerClassName)}>
          <div className="min-w-0 flex-1 ml-16">
            {title && (
              <div className="text-lg font-bold leading-8 ml-2">{title}</div>
            )}
            {headerLeft}
          </div>
          {headerRight ? <div className="shrink-0">{headerRight}</div> : null}
        </div>
      ) : (
        <div className="min-h-8"></div>
      )}

      <div className={cx("flex-1 overflow-y-auto pt-4", contentClassName)}>
        {children}
      </div>
    </div>
  );
};

export default DefaultAppView;
