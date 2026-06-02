import { motion } from "framer-motion";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { cx } from "@emotion/css";

type FadeStackPage = {
  key: string;
  element: ReactNode;
};

export interface StackedFadeStackProps {
  activeKey: string | null;
  element: ReactNode | null;
  className?: string;
  layerClassName?: string;
  maxSize?: number;
  duration?: number;
  ease?: "easeOut" | "linear" | "easeIn" | "easeInOut";
}

const StackedFadeStack = ({
  activeKey,
  element,
  className,
  layerClassName,
  maxSize = 6,
  duration = 0.18,
  ease = "easeOut",
}: StackedFadeStackProps) => {
  const elementRef = useRef(element);
  elementRef.current = element;

  const [pages, setPages] = useState<FadeStackPage[]>([]);
  const prevActiveKeyRef = useRef<string | null>(activeKey);
  const [leavingKey, setLeavingKey] = useState<string | null>(null);
  const leavingKeyRef = useRef<string | null>(null);
  leavingKeyRef.current = leavingKey;
  const [enteringKey, setEnteringKey] = useState<string | null>(null);
  const activeKeyRef = useRef<string | null>(activeKey);
  activeKeyRef.current = activeKey;

  const resolvedActive = useMemo(
    () => (activeKey && element ? { key: activeKey, element } : null),
    [activeKey, element],
  );

  useEffect(() => {
    if (!resolvedActive) return;
    setPages((prev) => {
      const existingIndex = prev.findIndex((p) => p.key === resolvedActive.key);
      if (existingIndex >= 0) {
        const current = prev[existingIndex];
        if (current?.element === resolvedActive.element) return prev;
        const next = prev.slice();
        next[existingIndex] = resolvedActive;
        return next;
      }

      const next = [...prev, resolvedActive];
      if (maxSize && next.length > maxSize)
        return next.slice(next.length - maxSize);
      return next;
    });
  }, [maxSize, resolvedActive]);

  useEffect(() => {
    const prevActive = prevActiveKeyRef.current;
    if (activeKey && prevActive && prevActive !== activeKey)
      setLeavingKey(prevActive);
    if (!activeKey) setLeavingKey(prevActive ?? null);

    if (activeKey && prevActive !== activeKey) {
      setEnteringKey(activeKey);
    } else {
      setEnteringKey(null);
    }

    prevActiveKeyRef.current = activeKey;
  }, [activeKey]);

  useEffect(() => {
    if (activeKey || leavingKey) return;
    setPages([]);
    prevActiveKeyRef.current = null;
    setEnteringKey(null);
  }, [activeKey, leavingKey]);

  if (!activeKey && !leavingKey) return null;

  return (
    <div className={cx("absolute inset-0 z-10", className)}>
      {pages.map((p) => {
        const isCurrent = p.key === activeKey;
        const isLeaving = p.key === leavingKey;
        const isVisible = isCurrent || isLeaving;

        return (
          <motion.div
            key={p.key}
            className={cx("absolute inset-0", layerClassName)}
            style={{
              display: isVisible ? "block" : "none",
              zIndex: isLeaving ? 2 : 1,
              pointerEvents: isCurrent ? "auto" : "none",
            }}
            initial={
              isCurrent && enteringKey === p.key ? { opacity: 0 } : false
            }
            animate={isVisible ? { opacity: isLeaving ? 0 : 1 } : false}
            transition={{ duration, ease }}
            onAnimationComplete={() => {
              if (p.key === leavingKeyRef.current) setLeavingKey(null);
              if (p.key === enteringKey && p.key === activeKeyRef.current)
                setEnteringKey(null);
            }}
          >
            {p.element}
          </motion.div>
        );
      })}
    </div>
  );
};

export default StackedFadeStack;
