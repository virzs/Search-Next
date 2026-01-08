import { useAppRouteContext } from "@/components";
import { motion } from "framer-motion";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useOutlet } from "react-router";
import type { StoreOutletContext } from "../index";
import WebsiteView from "./website";

type KeepAlivePage = {
  key: string;
  element: ReactNode;
};

const WebsiteStackOutlet = () => {
  const outlet = useOutlet();
  const location = useLocation();
  const key = useMemo(() => location.pathname, [location.pathname]);
  const activeKey = outlet ? key : null;
  const [pages, setPages] = useState<KeepAlivePage[]>([]);
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
        return prev;
      }

      const maxSize = 6;
      const next = [...prev, { key: activeKey, element: outlet }];
      if (next.length > maxSize) return next.slice(next.length - maxSize);
      return next;
    });
  }, [activeKey, outlet]);

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
    <div className="absolute inset-0 z-10">
      {pages.map((p) => {
        const isCurrent = p.key === activeKey;
        const isLeaving = p.key === leavingKey;
        const isVisible = isCurrent || isLeaving;

        return (
          <motion.div
            key={p.key}
            className="absolute inset-0"
            style={{
              display: isVisible ? "block" : "none",
              zIndex: isLeaving ? 2 : 1,
              pointerEvents: isCurrent ? "auto" : "none",
            }}
            initial={isCurrent && enteringKey === p.key ? { opacity: 0 } : false}
            animate={isVisible ? { opacity: isLeaving ? 0 : 1 } : false}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onAnimationComplete={() => {
              if (p.key === leavingKeyRef.current) {
                setLeavingKey(null);
              }
              if (p.key === enteringKey && p.key === activeKeyRef.current) {
                setEnteringKey(null);
              }
            }}
          >
            {p.element}
          </motion.div>
        );
      })}
    </div>
  );
};

const WebsiteLayoutRoute = () => {
  const { query, onAddWebsite } = useAppRouteContext<StoreOutletContext>();

  return (
    <div className="h-full relative overflow-hidden">
      <WebsiteView query={query} onAddWebsite={onAddWebsite} />
      <WebsiteStackOutlet />
    </div>
  );
};

export default WebsiteLayoutRoute;
