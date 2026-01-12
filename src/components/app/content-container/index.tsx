import { RiArrowLeftLine } from "@remixicon/react";
import { Button } from "antd";
import { cx } from "@emotion/css";
import type { FC, ReactNode } from "react";

export interface AppContentContainerProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
  onBack?: () => void;
  showBack?: boolean;
  backText?: ReactNode;
  title?: ReactNode;
  headerExtra?: ReactNode;
  headerClassName?: string;
  contentClassName?: string;
}

const AppContentContainer: FC<AppContentContainerProps> = ({
  children,
  className,
  animate,
  onBack,
  showBack = true,
  backText,
  title,
  headerExtra,
  headerClassName,
  contentClassName,
}) => {
  const showBackButton = Boolean(onBack && showBack);
  const showHeader = showBackButton || Boolean(title) || Boolean(headerExtra);

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
          {showBackButton ? (
            <Button
              type="text"
              className="rounded-full! !  hover:!"
              icon={<RiArrowLeftLine size={16} />}
              onClick={onBack}
            >
              {backText ?? "返回"}
            </Button>
          ) : null}
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
