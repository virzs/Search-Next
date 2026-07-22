import { useCallback, useEffect, useRef, useState } from "react";
import type { ScreenSaverConfig } from "@/contexts/DesktopThemeContext";

const POINTER_MOVE_ACTIVITY_INTERVAL_MS = 500;
const MODIFIER_KEYS = new Set(["Alt", "AltGraph", "Control", "Meta", "Shift"]);

export const SCREEN_SAVER_OVERLAY_Z_INDEX = 2_147_483_001;

export interface ScreenSaverController {
  active: boolean;
  covering: boolean;
  recordActivity: () => void;
  finishExit: () => void;
}

export const useScreenSaverController = (
  config: ScreenSaverConfig,
): ScreenSaverController => {
  const [active, setActive] = useState(false);
  const [covering, setCovering] = useState(false);
  const timerRef = useRef<number | null>(null);
  const activeRef = useRef(active);
  const coveringRef = useRef(covering);
  const configRef = useRef(config);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const lastPointerMoveRef = useRef(0);
  const suppressClickUntilRef = useRef(0);
  const focusRestoreFrameRef = useRef<number | null>(null);

  activeRef.current = active;
  coveringRef.current = covering;
  configRef.current = config;

  const clearTimer = useCallback(() => {
    if (timerRef.current === null) return;
    window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const activate = useCallback(() => {
    timerRef.current = null;
    if (
      document.hidden ||
      !configRef.current.enabled ||
      activeRef.current ||
      coveringRef.current
    ) {
      return;
    }

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    activeRef.current = true;
    coveringRef.current = true;
    setCovering(true);
    setActive(true);
  }, []);

  const schedule = useCallback(() => {
    clearTimer();
    if (
      document.hidden ||
      !configRef.current.enabled ||
      activeRef.current ||
      coveringRef.current
    ) {
      return;
    }
    timerRef.current = window.setTimeout(
      activate,
      configRef.current.timeoutMinutes * 60_000,
    );
  }, [activate, clearTimer]);

  const recordActivity = useCallback(() => {
    if (activeRef.current || coveringRef.current || document.hidden) return;
    schedule();
  }, [schedule]);

  const wake = useCallback((suppressFollowUpClick = false) => {
    if (!activeRef.current) return;
    clearTimer();
    suppressClickUntilRef.current = suppressFollowUpClick
      ? performance.now() + 1_000
      : 0;
    activeRef.current = false;
    setActive(false);
  }, [clearTimer]);

  const finishExit = useCallback(() => {
    coveringRef.current = false;
    setCovering(false);

    const previousFocus = previousFocusRef.current;
    previousFocusRef.current = null;
    if (focusRestoreFrameRef.current !== null) {
      window.cancelAnimationFrame(focusRestoreFrameRef.current);
    }
    focusRestoreFrameRef.current = window.requestAnimationFrame(() => {
      focusRestoreFrameRef.current = null;
      if (previousFocus?.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    });
    schedule();
  }, [schedule]);

  useEffect(() => {
    if (!config.enabled) {
      clearTimer();
      if (activeRef.current) wake();
      return;
    }
    schedule();
    return clearTimer;
  }, [clearTimer, config.enabled, config.timeoutMinutes, schedule, wake]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearTimer();
        return;
      }
      if (!activeRef.current && !coveringRef.current) schedule();
    };

    const handlePointerMove = () => {
      if (activeRef.current || coveringRef.current) return;
      const now = performance.now();
      if (
        now - lastPointerMoveRef.current <
        POINTER_MOVE_ACTIVITY_INTERVAL_MS
      ) {
        return;
      }
      lastPointerMoveRef.current = now;
      recordActivity();
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (coveringRef.current) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      suppressClickUntilRef.current = 0;
      recordActivity();
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!coveringRef.current) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (activeRef.current) wake(true);
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (coveringRef.current) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      suppressClickUntilRef.current = 0;
      recordActivity();
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (!coveringRef.current) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (activeRef.current) wake(true);
    };

    const handleWheel = (event: WheelEvent) => {
      if (coveringRef.current) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      recordActivity();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (coveringRef.current) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (activeRef.current && !MODIFIER_KEYS.has(event.key)) wake();
        return;
      }
      recordActivity();
    };

    const handleClick = (event: MouseEvent) => {
      if (
        !coveringRef.current &&
        performance.now() >= suppressClickUntilRef.current
      ) {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pointermove", handlePointerMove, {
      capture: true,
      passive: true,
    });
    window.addEventListener("pointerdown", handlePointerDown, {
      capture: true,
      passive: false,
    });
    window.addEventListener("pointerup", handlePointerUp, true);
    window.addEventListener("touchstart", handleTouchStart, {
      capture: true,
      passive: false,
    });
    window.addEventListener("touchend", handleTouchEnd, {
      capture: true,
      passive: false,
    });
    window.addEventListener("wheel", handleWheel, {
      capture: true,
      passive: false,
    });
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("click", handleClick, true);
    window.addEventListener("auxclick", handleClick, true);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pointermove", handlePointerMove, true);
      window.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("pointerup", handlePointerUp, true);
      window.removeEventListener("touchstart", handleTouchStart, true);
      window.removeEventListener("touchend", handleTouchEnd, true);
      window.removeEventListener("wheel", handleWheel, true);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("click", handleClick, true);
      window.removeEventListener("auxclick", handleClick, true);
      if (focusRestoreFrameRef.current !== null) {
        window.cancelAnimationFrame(focusRestoreFrameRef.current);
        focusRestoreFrameRef.current = null;
      }
    };
  }, [clearTimer, recordActivity, schedule, wake]);

  return { active, covering, recordActivity, finishExit };
};
