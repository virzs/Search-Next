import { motion } from "framer-motion";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useOutlet } from "react-router";

type FadePage = {
  key: string;
  element: ReactNode;
};

export interface StackedFadeOutletProps {
  className?: string;
  layerClassName?: string;
  maxSize?: number;
  duration?: number;
  ease?: "easeOut" | "linear" | "easeIn" | "easeInOut";
  getKey?: (location: ReturnType<typeof useLocation>) => string;
}

const StackedFadeOutlet = ({
  className,
  layerClassName,
  maxSize = 6,
  duration = 0.18,
  ease = "easeOut",
  getKey,
}: StackedFadeOutletProps) => {
  const outlet = useOutlet();
  const location = useLocation();
  const key = useMemo(
    () => (getKey ? getKey(location) : location.pathname),
    [getKey, location],
  );
  const activeKey = outlet ? key : null;
  const [pages, setPages] = useState<FadePage[]>([]);
  const prevActiveKeyRef = useRef<string | null>(activeKey);
  const [leavingKey, setLeavingKey] = useState<string | null>(null);
  const leavingKeyRef = useRef<string | null>(null);
  leavingKeyRef.current = leavingKey;
  const [enteringKey, setEnteringKey] = useState<string | null>(null);
  const activeKeyRef = useRef<string | null>(activeKey);
  activeKeyRef.current = activeKey;

  useEffect(() => {
    if (!outlet || !activeKey) return;
    setPages((prev) => {
      const existingIndex = prev.findIndex((p) => p.key === activeKey);
      if (existingIndex >= 0) {
        const current = prev[existingIndex];
        if (current?.element === outlet) return prev;
        const next = prev.slice();
        next[existingIndex] = { key: activeKey, element: outlet };
        return next;
      }

      const next = [...prev, { key: activeKey, element: outlet }];
      if (maxSize && next.length > maxSize) return next.slice(next.length - maxSize);
      return next;
    });
  }, [activeKey, maxSize, outlet]);

  useEffect(() => {
    if (activeKey || leavingKey) return;
    setPages([]);
    prevActiveKeyRef.current = null;
    setEnteringKey(null);
  }, [activeKey, leavingKey]);

  useEffect(() => {
    const prevActive = prevActiveKeyRef.current;

    if (activeKey && prevActive && prevActive !== activeKey) setLeavingKey(prevActive);
    if (!activeKey) setLeavingKey(null);

    if (activeKey && prevActive !== activeKey) {
      setEnteringKey(activeKey);
    } else {
      setEnteringKey(null);
    }

    prevActiveKeyRef.current = activeKey;
  }, [activeKey]);

  if (!activeKey && !leavingKey) return null;

  return (
    <div className={["absolute inset-0 z-10", className].filter(Boolean).join(" ")}>
      {pages.map((p) => {
        const isCurrent = p.key === activeKey;
        const isLeaving = p.key === leavingKey;
        const isVisible = isCurrent || isLeaving;

        return (
          <motion.div
            key={p.key}
            className={["absolute inset-0", layerClassName].filter(Boolean).join(" ")}
            style={{
              display: isVisible ? "block" : "none",
              zIndex: isLeaving ? 2 : 1,
              pointerEvents: isCurrent ? "auto" : "none",
            }}
            initial={isCurrent && enteringKey === p.key ? { opacity: 0 } : false}
            animate={isVisible ? { opacity: isLeaving ? 0 : 1 } : false}
            transition={{ duration, ease }}
            onAnimationComplete={() => {
              if (p.key === leavingKeyRef.current) setLeavingKey(null);
              if (p.key === enteringKey && p.key === activeKeyRef.current) setEnteringKey(null);
            }}
          >
            {p.element}
          </motion.div>
        );
      })}
    </div>
  );
};

export default StackedFadeOutlet;

