import { css, cx } from "@emotion/css";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import type { AppLanguage } from "@/i18n";
import { SCREEN_SAVER_OVERLAY_Z_INDEX } from "./screen-saver-controller";

const MotionDiv = motion.div as any;

export interface ScreenSaverOverlayProps {
  active: boolean;
  covering: boolean;
  background: ReactNode;
  language: AppLanguage;
  wakeLabel: string;
  onExitComplete: () => void;
}

export const ScreenSaverOverlay = ({
  active,
  covering,
  background,
  language,
  wakeLabel,
  onExitComplete,
}: ScreenSaverOverlayProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!active) return undefined;
    let timer = 0;
    const update = () => {
      const next = new Date();
      setNow(next);
      timer = window.setTimeout(
        update,
        60_000 - (next.getTime() % 60_000) + 25,
      );
    };
    update();
    return () => window.clearTimeout(timer);
  }, [active]);

  useEffect(() => {
    if (!covering) return undefined;
    const previousAttributes = new Map<
      HTMLElement,
      { inert: string | null; ariaHidden: string | null }
    >();

    const protect = (element: HTMLElement) => {
      if (
        previousAttributes.has(element) ||
        element.contains(overlayRef.current)
      ) {
        return;
      }
      previousAttributes.set(element, {
        inert: element.getAttribute("inert"),
        ariaHidden: element.getAttribute("aria-hidden"),
      });
      element.setAttribute("inert", "");
      element.setAttribute("aria-hidden", "true");
    };

    Array.from(document.body.children).forEach((element) => {
      if (element instanceof HTMLElement) protect(element);
    });

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (
            node instanceof HTMLElement &&
            node.parentElement === document.body
          ) {
            protect(node);
          }
        });
      });
    });
    observer.observe(document.body, { childList: true });

    return () => {
      observer.disconnect();
      previousAttributes.forEach((attributes, element) => {
        if (attributes.inert === null) element.removeAttribute("inert");
        else element.setAttribute("inert", attributes.inert);
        if (attributes.ariaHidden === null) {
          element.removeAttribute("aria-hidden");
        } else {
          element.setAttribute("aria-hidden", attributes.ariaHidden);
        }
      });
    };
  }, [covering]);

  useEffect(() => {
    if (!active) return undefined;
    const frame = window.requestAnimationFrame(() => {
      overlayRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [active]);

  const formattedTime = useMemo(
    () =>
      new Intl.DateTimeFormat(language, {
        hour: "2-digit",
        minute: "2-digit",
      }).format(now),
    [language, now],
  );

  const timeParts = useMemo(
    () =>
      new Intl.DateTimeFormat(language, {
        hour: "2-digit",
        minute: "2-digit",
      }).formatToParts(now),
    [language, now],
  );

  return createPortal(
    <AnimatePresence initial={false} onExitComplete={onExitComplete}>
      {active ? (
        <MotionDiv
          ref={overlayRef}
          key="screen-saver"
          role="button"
          tabIndex={0}
          aria-label={wakeLabel}
          data-screen-saver-overlay
          className={cx(
            "fixed inset-0 flex select-none items-start justify-center overflow-hidden bg-black outline-none",
            screenSaverOverlayClassName,
          )}
          style={{ zIndex: SCREEN_SAVER_OVERLAY_Z_INDEX }}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={
            reducedMotion
              ? { opacity: 0, y: 0 }
              : { opacity: 0.78, y: "-100%" }
          }
          transition={
            reducedMotion
              ? { type: "tween", duration: 0.18, ease: "easeOut" }
              : { type: "spring", bounce: 0, duration: 0.4 }
          }
          onContextMenu={(event) => event.preventDefault()}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          >
            {background}
          </div>
          <div
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute inset-0 z-[1]",
              screenSaverScrimClassName,
            )}
          />
          <time
            dateTime={now.toISOString()}
            aria-label={formattedTime}
            className={cx(
              "relative z-[2] mt-[clamp(5rem,12.5vh,8.5rem)] inline-flex max-w-[94vw] items-center justify-center text-center text-white",
              screenSaverTimeClassName,
            )}
          >
            <span aria-hidden="true" className="contents">
              {timeParts.map((part, index) => {
                if (part.type === "hour" || part.type === "minute") {
                  return (
                    <span
                      key={`${part.type}-${index}`}
                      className={screenSaverTimeDigitsClassName}
                    >
                      {part.value}
                    </span>
                  );
                }

                if (part.type === "dayPeriod") {
                  return (
                    <span
                      key={`${part.type}-${index}`}
                      className={screenSaverTimeDayPeriodClassName}
                    >
                      {part.value}
                    </span>
                  );
                }

                if (!part.value.trim()) return null;
                return (
                  <span
                    key={`${part.type}-${index}`}
                    className={screenSaverTimeSeparatorClassName}
                  >
                    {part.value}
                  </span>
                );
              })}
            </span>
          </time>
        </MotionDiv>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
};

const screenSaverOverlayClassName = css`
  cursor: default;
  touch-action: none;
  will-change: transform, opacity;
`;

const screenSaverTimeClassName = css`
  font-family:
    -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue",
    "Segoe UI", system-ui, sans-serif;
  font-size: clamp(4.5rem, 10.5vw, 8.75rem);
  font-weight: 300;
  font-synthesis: none;
  font-optical-sizing: auto;
  font-variant-numeric: tabular-nums lining-nums;
  font-feature-settings:
    "kern" 1,
    "tnum" 1;
  line-height: 0.9;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  text-shadow:
    0 1px 2px rgba(0, 0, 0, 0.3),
    0 7px 26px rgba(0, 0, 0, 0.18);
`;

const screenSaverTimeDigitsClassName = css`
  display: inline-block;
  letter-spacing: -0.055em;
`;

const screenSaverTimeSeparatorClassName = css`
  display: inline-block;
  margin: 0 0.045em 0 0.085em;
  font-size: 0.7em;
  font-weight: 400;
  line-height: 1;
  opacity: 0.94;
  transform: translateY(-0.035em);
`;

const screenSaverTimeDayPeriodClassName = css`
  align-self: flex-end;
  margin: 0 0 0.08em 0.52em;
  font-size: 0.17em;
  font-weight: 520;
  letter-spacing: 0.035em;
  line-height: 1;
  opacity: 0.9;
`;

const screenSaverScrimClassName = css`
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.42) 0%,
    rgba(0, 0, 0, 0.14) 46%,
    rgba(0, 0, 0, 0.18) 100%
  );

  @media (prefers-contrast: more) {
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.62) 0%,
      rgba(0, 0, 0, 0.32) 50%,
      rgba(0, 0, 0, 0.38) 100%
    );
  }
`;

export default ScreenSaverOverlay;
