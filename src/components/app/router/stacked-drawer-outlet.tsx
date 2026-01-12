import { motion } from "framer-motion";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigationType, useOutlet } from "react-router";
import { cx } from "@emotion/css";

type DrawerTransitionPhase = "idle" | "forward" | "back";

type DrawerPage = {
  key: string;
  element: ReactNode;
};

export interface StackedDrawerOutletProps {
  className?: string;
  layerClassName?: string;
  getKey?: (location: ReturnType<typeof useLocation>) => string;
  transition?: {
    type?: "spring" | "tween";
    duration?: number;
    ease?: "easeOut" | "linear" | "easeIn" | "easeInOut";
    stiffness?: number;
    damping?: number;
  };
}

const defaultTransition = {
  type: "spring" as const,
  stiffness: 320,
  damping: 34,
};

const StackedDrawerOutlet = ({
  className,
  layerClassName,
  getKey,
  transition,
}: StackedDrawerOutletProps) => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const outlet = useOutlet();
  const outletRef = useRef(outlet);
  outletRef.current = outlet;

  const resolvedTransition = useMemo(
    () => ({
      ...defaultTransition,
      ...(transition ?? {}),
    }),
    [transition],
  );

  const key = useMemo(
    () => (getKey ? getKey(location) : location.pathname),
    [getKey, location],
  );
  const [current, setCurrent] = useState<DrawerPage | null>(
    outlet ? { key, element: outlet } : null,
  );
  const [from, setFrom] = useState<DrawerPage | null>(null);
  const [to, setTo] = useState<DrawerPage | null>(null);
  const [phase, setPhase] = useState<DrawerTransitionPhase>("idle");
  const committedKeyRef = useRef<string | null>(outlet ? key : null);

  useEffect(() => {
    const committedKey = committedKeyRef.current;
    const nextOutlet = outletRef.current;
    const nextPage = nextOutlet ? { key, element: nextOutlet } : null;

    if (!committedKey) {
      committedKeyRef.current = key;
      if (nextPage) {
        setFrom(null);
        setTo(nextPage);
        setPhase("forward");
      } else {
        setCurrent(null);
        setPhase("idle");
        setFrom(null);
        setTo(null);
      }
      return;
    }

    if (committedKey === key) {
      return;
    }

    const isBack = navigationType === "POP";
    committedKeyRef.current = key;

    if (!nextPage) {
      if (current) {
        setFrom(current);
        setTo(null);
        setPhase("back");
      } else {
        setCurrent(null);
        setFrom(null);
        setTo(null);
        setPhase("idle");
      }
      return;
    }

    setFrom(current);
    setTo(nextPage);
    setPhase(isBack ? "back" : "forward");
  }, [current, key, navigationType]);

  const shouldRender = current || from || to;
  if (!shouldRender) return null;

  const baseLayer = phase === "back" ? to : (from ?? current);
  const frontLayer = phase === "back" ? from : to;

  return (
    <div className={cx("relative h-full w-full overflow-hidden", className)}>
      {phase === "idle" && current ? (
        <div className={cx("absolute inset-0", layerClassName)}>
          {current.element}
        </div>
      ) : baseLayer ? (
        <div
          className={cx("absolute inset-0", layerClassName)}
          style={{ pointerEvents: phase === "idle" ? "auto" : "none" }}
        >
          {baseLayer.element}
        </div>
      ) : null}

      {frontLayer ? (
        <motion.div
          key={frontLayer.key}
          className={cx("absolute inset-0", layerClassName)}
          initial={
            phase === "forward"
              ? { x: "100%", opacity: 0 }
              : { x: 0, opacity: 1 }
          }
          animate={
            phase === "back" ? { x: "100%", opacity: 0 } : { x: 0, opacity: 1 }
          }
          transition={resolvedTransition}
          onAnimationComplete={() => {
            if (phase === "forward") {
              setCurrent(frontLayer);
              setFrom(null);
              setTo(null);
              setPhase("idle");
              return;
            }

            if (phase === "back") {
              setCurrent(to);
              setFrom(null);
              setTo(null);
              setPhase("idle");
            }
          }}
        >
          {frontLayer.element}
        </motion.div>
      ) : null}
    </div>
  );
};

export default StackedDrawerOutlet;
