import { FC, useEffect, useState } from "react";
import { Spin } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { css, cx } from "@emotion/css";

const MotionDiv = motion.div as any;

export interface LoadingOverlayProps {
  open: boolean;
  text?: string;
  delayMs?: number;
  spinSize?: "small" | "default" | "large";
  className?: string;
}

const LoadingOverlay: FC<LoadingOverlayProps> = ({
  open,
  text = "正在加载…",
  delayMs = 0,
  spinSize = "large",
  className,
}) => {
  const [visible, setVisible] = useState(open && delayMs <= 0);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }

    if (delayMs <= 0) {
      setVisible(true);
      return;
    }

    const timer = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs, open]);

  return (
    <AnimatePresence initial={false}>
      {visible ? (
        <MotionDiv
          className={cx(
            "fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden",
            loadingOverlayClassName,
            className,
          )}
          style={{
            background:
              "linear-gradient(180deg, rgba(250,250,252,0.58), rgba(245,245,247,0.78))",
            backdropFilter: "blur(24px) saturate(1.18)",
          }}
          role="status"
          aria-live="polite"
          aria-busy="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <MotionDiv
            className="relative z-[1] flex min-w-[176px] flex-col items-center gap-3 rounded-[22px] border border-white/70 bg-white/80 px-7 py-6 shadow-[0_24px_70px_rgba(0,0,0,0.18)]"
            style={{
              backdropFilter: "blur(28px) saturate(1.18)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.86), 0 24px 70px rgba(0,0,0,0.18)",
            }}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.99 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <Spin size={spinSize} />
            <div className="text-sm font-semibold tracking-normal text-[#1d1d1f]">
              {text}
            </div>
          </MotionDiv>
        </MotionDiv>
      ) : null}
    </AnimatePresence>
  );
};

export default LoadingOverlay;

const loadingOverlayClassName = css`
  .ant-spin-dot-holder {
    color: #007aff;
  }

  .ant-spin-dot-item {
    background-color: #007aff !important;
  }
`;
